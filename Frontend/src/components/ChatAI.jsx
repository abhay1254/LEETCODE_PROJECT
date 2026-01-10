import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axios";
import { Send } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'model', parts:[{text: "Hi! I'm your DSA tutor. How can I help you with this problem?"}]}
    ]);

    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const newMessage = { role: 'user', parts:[{text: data.message}] };
        const updatedMessages = [...messages, newMessage];
        
        setMessages(updatedMessages);
        reset();

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibletestcases,
                startCode: problem.startcode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            console.error("Error details:", error.response?.data);
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: `Sorry, I encountered an error: ${error.response?.data?.error || error.message}`}]
            }]);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[60vh] min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-bubble bg-base-200 text-base-content whitespace-pre-wrap">
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask me anything about this problem..." 
                        className="input input-bordered flex-1" 
                        {...register("message", { 
                            required: true, 
                            minLength: 1,
                            validate: value => value.trim().length > 0
                        })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                        disabled={errors.message}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;