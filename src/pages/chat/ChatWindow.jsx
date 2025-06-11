import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Send, ReceiptText, X } from 'lucide-react';
import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { getDocs, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export default function ChatWindow({ userData }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([])
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false)
    const [shop, setShop] = useState([])
    const messagesEndRef = useRef(null);

    function open() {
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    useEffect(() => {
        const fetchData = async () => {
            const onSnapShop = await getDocs(collection(db, "Shops"))
            const shop = onSnapShop.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const filteredShop = shop.filter(shop => shop.id === auth.currentUser.uid)

            setShop(filteredShop[0] || null)
        }
        fetchData()
    }, [])

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "Contacts"), (snapshot) => {
            const fetchedContacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const filteredContacts = fetchedContacts.filter(c => c.user_id === auth.currentUser.uid)

            if (!id && filteredContacts.length > 0) {
                navigate(`/chats/${filteredContacts[0].id}`, { replace: true });
            }

            if (id) {
                const selected = filteredContacts.find(c => c.id === id);
                if (selected) {
                    setSelectedContact(selected);
                }
            }
            setContacts(filteredContacts);

        });

        return () => unsubscribe()
    }, [id, navigate]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (!selectedContact) return

        const messageQuery = query(collection(db, "Messages"),
            where("sender_id", "in", [auth.currentUser.uid, selectedContact.contact_id]),
            where("recipient_id", "in", [auth.currentUser.uid, selectedContact.contact_id]),
            orderBy("timestamp", "asc"))

        const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

            const filterMsgs = msgs.filter(msg => (msg.sender_id === auth.currentUser.uid && msg.recipient_id === selectedContact.contact_id) ||
                (msg.sender_id === selectedContact.contact_id && msg.recipient_id === auth.currentUser.uid))

            setMessages(filterMsgs)
        })

        return () => unsubscribe()
    }, [selectedContact])

    const enterTrigger = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setIsSending(true)
            handleSendMessage()
        }
    }

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedContact) return;
        setIsSending(true)

        const contactsRef = collection(db, "Contacts");

        const q = query(contactsRef,
            where("user_id", "==", selectedContact.contact_id),
            where("contact_id", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await setDoc(doc(contactsRef), {
                user_id: selectedContact.contact_id,
                contact_id: auth.currentUser.uid,
                name: userData?.role === "Event Planner" ? userData.first_name : shop.supplier_name,
                last_message: "",
                isActive: false,
                created_at: serverTimestamp()
            });

            console.log("test")
        };

        setMessage('');

        await addDoc(collection(db, "Messages"), {
            sender_id: auth.currentUser.uid,
            recipient_id: selectedContact.contact_id,
            text: message,
            timestamp: serverTimestamp()
        });

        setIsSending(false)
    }

    console.log(selectedContact)

    return (
        <>
            <h1 className="mb-5 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chat</h1>
            <div className="flex h-screen shadow-lg bg-gray-100 border border-gray-300 rounded-lg">

                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Names"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Contacts List */}
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => navigate(`/chats/${contact.id}`)}
                                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className={`w-10 h-10  ${selectedContact?.id === contact.id ? 'bg-blue-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-semibold`}>
                                    {contact.avatar?.toUpperCase() || contact.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                        {contact.name}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {contact?.last_message || 'No message yet'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {contacts.length === 0 && (
                            <div className="text-gray-600 flex justify-center mt-56">No contacts</div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 bg-white border-b border-gray-200">
                        {selectedContact ? (
                            <div className="flex justify-between items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 ${selectedContact ? 'bg-blue-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                        {selectedContact.name?.[0]}
                                    </div>
                                    <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                                </div>

                                {/* Modal Trigger Button */}
                                <Button onClick={open}>
                                    <ReceiptText size={24} className="transition-all duration-75 text-gray-600 hover:text-blue-600 " />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-gray-400 italic">Select a contact and start chatting</div>
                        )}
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            {selectedContact && messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender_id === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                    <div className="flex flex-col space-y-2">
                                        <div className={`text-sm text-gray-600 ${selectedContact.contact_id === msg.sender_id ? 'justify-start' : 'text-right mr-3'}`}>
                                            {selectedContact.contact_id === msg.sender_id ? selectedContact.name : 'You'}
                                        </div>
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender_id === auth.currentUser.uid ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 shadow-sm border border-gray-200'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={message}
                                onKeyDown={enterTrigger}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Send message"
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button disabled={isSending} onClick={handleSendMessage} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Modal */}
            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            {/* Close Button */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Contract
                                </h3>
                                <button
                                    onClick={close}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            {selectedContact && (
                                <div className="space-y-6">
                                    {/* Contact Avatar and Name */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {selectedContact.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {selectedContact.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Contact ID: {selectedContact.contact_id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Status
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {selectedContact.isActive ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Message
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {selectedContact.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Created
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {selectedContact.created_at?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Total Messages
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {messages.length} messages
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={close}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Add any additional action here
                                                close();
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Send a Contract
                                        </button>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}