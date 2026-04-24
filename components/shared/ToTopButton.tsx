import React from 'react';
import { MoveUp } from "lucide-react";

const ToTopButton = () => {

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-5 bg-background z-50 p-2 border rounded-xl shadow shadow-foreground"
        >
            <MoveUp size={18} />
        </button>
    );
};

export default ToTopButton;