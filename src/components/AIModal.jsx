import { Button, Dialog, DialogPanel } from '@headlessui/react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { Bot, X, Search } from "lucide-react"
import { useState } from 'react'
import { db } from '../firebase/firebase'

export default function AIModal({ ai_response, ai_shops }) {
    const [isOpen, setIsOpen] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [recommendations, setRecommendations] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    const handleAiSearch = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!prompt.trim()) {
            setError('Please describe what you are looking for.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Get all shops (no category filter)
            const q = query(collection(db, "Shops"));
            const snapShop = await getDocs(q);
            const shops = snapShop.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            ai_shops([]);
            ai_response('');

            const shopData = await Promise.all(snapShop.docs.map(async (doc) => {
                const data = doc.data();
                const shopId = doc.id;

                const reviewSnapshot = await getDocs(collection(db, "Shops", shopId, "Reviews"));

                let sum = 0;
                reviewSnapshot.forEach((rev) => {
                    sum += parseFloat(rev.data().rating || 0);
                });

                const avgRating = reviewSnapshot.size > 0 ?
                    (sum / reviewSnapshot.size).toFixed(1) : 0;

                const latestReviewQuery = query(
                    collection(db, "Shops", shopId, "Reviews"),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );

                const latestReviewSnapshot = await getDocs(latestReviewQuery);
                let latestReviewText = '';

                if (!latestReviewSnapshot.empty) {
                    latestReviewText = latestReviewSnapshot.docs[0].data().comment;
                }

                return {
                    id: shopId,
                    name: data.supplier_name,
                    category: data.supplier_type?.label || '',
                    expertise: data.supplier_expertise || [],
                    avg_rating: parseFloat(avgRating),
                    reviews: latestReviewText,
                    ...data
                };
            }));

            if (shopData.length === 0) {
                setError("No suppliers found.");
                setIsSubmitting(false);
                return;
            }

            // Filter shops based on prompt keywords
            const promptLower = prompt.toLowerCase();
            const filteredShops = shopData.filter(shop => {
                // Check if prompt mentions rating
                const ratingMatch = promptLower.includes('rating') ||
                    promptLower.includes('5') ||
                    promptLower.includes('five');

                // Check if shop matches any keywords in prompt
                const keywordMatch =
                    shop.supplier_name.toLowerCase().includes(promptLower) ||
                    shop.supplier_type.value.toLowerCase().includes(promptLower) ||
                    shop.supplier_expertise.some(expertise =>
                        expertise.toLowerCase().includes(promptLower)
                    ) ||
                    promptLower.includes(shop.category.toLowerCase()) ||
                    shop.expertise.some(expertise =>
                        promptLower.includes(expertise.toLowerCase())
                    );

                // Apply rating filter if mentioned
                if (ratingMatch) {
                    return shop.avg_rating >= 5 && keywordMatch;
                }
                return keywordMatch;
            });

            if (filteredShops.length === 0) {
                setError("No suppliers match your search criteria.");
                setIsSubmitting(false);
                return;
            }

            // Sort shops by rating in ascending order
            const sortedShops = [...filteredShops].sort((a, b) => b.avg_rating - a.avg_rating);

            // Send data to AI recommendation endpoint
            const response = await fetch("http://localhost:8000/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_prompt: prompt,
                    suppliers: sortedShops
                }),
            });

            const data = await response.json();

            // Update state with results
            setRecommendations(data.recommendations);
            ai_response(data.recommendations);

            // Map back to full shop objects for display
            const recommendedShops = sortedShops.filter(shop =>
                data.recommendations.includes(shop.name)
            );
            ai_shops(recommendedShops);

            setIsSubmitting(false);
            close();
        }
         catch (error) {
            console.error("Error during AI search:", error);
            setError("An error occurred while processing your request.");
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                onClick={open}
                className="relative overflow-hidden transition-all rounded-full hover:scale-105 px-6 py-2 text-white bg-gradient-to-r from-blue-600 via-purple-500 to-violet-600 bg-[length:200%_200%] duration-500 ease-in-out hover:bg-[position:100%_100%] flex items-center gap-3"
            >
                <Bot size={21} />
                <span className="hidden sm:block md:block lg:block">AI Search</span>
            </Button>

            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <div className="fixed inset-0 bg-black/25" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <div className='relative px-10 py-7 bg-gray-100 rounded-t-xl'>
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>

                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-blue-600">
                                        AI Supplier Search
                                    </h2>
                                </div>
                                <p className="text-gray-600 text-sm">Find the perfect suppliers for your event using AI-powered recommendations</p>
                            </div>

                            <form onSubmit={handleAiSearch}>
                                <div className='flex flex-col px-10 py-5'>
                                    <div className='relative flex flex-col'>
                                        <label htmlFor="search" className='text-sm mb-2 text-gray-800 font-bold'>What are you looking for?</label>
                                        <input
                                            onChange={(e) => setPrompt(e.target.value)}
                                            type="text"
                                            placeholder="Example: 'Event suppliers with at least 5 star rating'"
                                            className='rounded-lg focus:outline-none border border-gray-300 shadow-lg py-2 px-4'
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Describe your needs (e.g., "wedding florist", "corporate event planner", "5 star caterers")
                                        </p>
                                    </div>

                                    {error && (
                                        <span className='mt-5 text-red-500'>{error}</span>
                                    )}
                                    <button
                                        disabled={isSubmitting}
                                        className={`${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-md mt-7 py-2 rounded-md text-white flex justify-center text-center items-center gap-3`}
                                    >
                                        {isSubmitting ? <div className='h-4 w-4 rounded-full border border-t-2 animate-spin'></div> : <Search size={21} />}
                                        Search with AI
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}