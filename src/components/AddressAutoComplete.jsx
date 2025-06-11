import { useState, useEffect } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

export default function AddressAutocomplete({ setLocation, default_location = "", disabled, className }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([])
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {

        if (!isTyping) {
            setQuery(default_location)
        }

    }, [default_location])

    const handleChange = async (e) => {
        const value = e.target.value;
        setQuery(value);
        setIsTyping(true)
        setLocation(value)


        if (value.length < 2) {
            setSuggestions([])
            return;
        }

        const response = await fetch(`https://photon.komoot.io/api/?q=${value}&bbox=123.80,10.25,123.95,10.40`)
        const data = await response.json();
        setSuggestions(data.features);
    }

    const handleClick = (item) => {
        const location = [
            item.properties.name,
            item.properties.city,
            item.properties.country,
        ].filter(Boolean).join(", ")
        setSuggestions([])
        setLocation(location)
        setQuery(location)
    }

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setSuggestions([])}>
                <div>
                    <input type="text" disabled={disabled} className={`focus:ring-2 focus:outline-none px-2 focus:ring-blue-500 ring-1 w-full ring-black ${className}`}
                        value={query}
                        required
                        placeholder="Type an address"
                        onChange={handleChange} />

                    {suggestions.length > 0 &&
                        <ul className={`bg-white border ${query.length > 0 ? "block" : "hidden"} border-gray-300 rounded-lg mt-2 max-h-60 overflow-y-auto z-10 absolute`}>
                            {suggestions.map((item, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-blue-200 cursor-pointer text-sm"
                                    onClick={() => handleClick(item)}
                                >
                                    {[item.properties.name, item.properties.city, item.properties.country].filter(Boolean).join(", ")}
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            </OutsideClickHandler>
        </>
    )
}
