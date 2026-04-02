import { useDispatch } from "react-redux"
import { setName } from "../Redux/Features/UserSlice"
import { useState } from "react"

export function AskName() {
    const dispatch = useDispatch()
    const [inputValue, setInputValue] = useState("")

    const handleEnter = () => {
        if (inputValue.trim()) {
            dispatch(setName(inputValue))
            setInputValue("")
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-orange-500/10">
                
                {/* Heading */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        What's Your Name?
                    </h2>
                    <p className="text-[#888] text-sm">
                        Enter your name to join the meeting
                    </p>
                </div>

                {/* Input Section */}
                <div className="space-y-4 mb-6">
                    <input 
                        placeholder="Enter your name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEnter()}
                        autoFocus
                        className="w-full px-4 py-3.5 bg-[#242424] border border-white/10 rounded-lg text-white placeholder-[#666] outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200"
                    />
                </div>

                {/* Button */}
                <button 
                    onClick={handleEnter}
                    disabled={!inputValue.trim()}
                    className="w-full px-6 py-3.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                >
                    Enter Meeting
                </button>

                {/* Bottom note */}
                <p className="text-center text-[#555] text-xs mt-4">
                    You can change your name anytime during the meeting
                </p>

            </div>
        </div>
    )
}