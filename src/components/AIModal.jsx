import { Button, Dialog, DialogPanel} from '@headlessui/react'
import { Bot, X, Sparkles, Search } from "lucide-react"
import { useState } from 'react'
import Select from 'react-select'

export default function AIModal() {

    const [isOpen, setIsOpen] = useState(false)

    const categoriesOptions = [
        { label: 'Catering', value: 'catering' },
        { label: 'Photography', value: 'photography' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Decoration', value: 'decoration' },
        { label: 'Security', value: 'security' },
        { label: 'Transportation', value: 'transportation' },
        { label: 'Audio/Visual', value: 'audiovisual' },
        { label: 'Venue', value: 'venue' },
    ];

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

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
                                    {/* <div className="p-2 rounded-xl bg-blue-600">
                                        <Sparkles size={24} className="text-white" />
                                    </div> */}
                                    <h2 className="text-3xl font-bold text-blue-600">
                                        AI Supplier Search
                                    </h2>
                                </div>
                                <p className="text-gray-600 text-sm">Find the perfect suppliers for your event using AI-powered recommendations</p>

                            </div>

                            <div className='flex flex-col px-10 py-5'>

                                <div className='relative flex flex-col mt-5'>
                                    <label htmlFor="search" className='text-sm mb-2 text-gray-800 font-bold'>What are you looking for?</label>
                                    <input type="text" placeholder="e.g., wedding photographer with vintage style" className='rounded-lg focus:outline-none border border-gray-300 shadow-lg py-2 px-4' />
                                </div>

                                <label htmlFor="search" className='text-sm mb-2 text-gray-800 font-bold mt-5'>Category</label>
                                <Select
                                    options={categoriesOptions}
                                    placeholder="Select a Category..."
                                />

                                <button className='bg-blue-600 hover:bg-blue-700 text-md mt-7 py-2 rounded-md text-white flex justify-center text-center items-center gap-3'><Search size={21}/> Search with AI</button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}