const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

let userMessage = null;

const API_URL = `https://eeb5-2001-e68-543a-c054-8065-5f4a-86a4-d541.ngrok-free.app`;

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
        }
    }, 75);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");


    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Ensure correct content type
            },
            body: JSON.stringify({
                question: userMessage // Pass the user query as required by the API
            })
        });

        // Check if response is valid before attempting to use it
        if (!response || !response.ok) {
            throw new Error(`HTTP error! Status: ${response?.status || "No response"}`);
        }

        const data = await response.json();

        // Extract the chatbot's response from the 'response' key
        const apiResponse = data?.response || "No response found";
        textElement.innerText = apiResponse;
        showTypingEffect(apiResponse, textElement);

        return apiResponse; // Return the response if needed elsewhere
    } 
    catch (error) {
        // Handle both network errors and failed HTTP requests
        console.error("Error generating API response:", error.message || error);
        return "Sorry, something went wrong while processing your request.";
    }
    finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                <img src="./assets/flower.png" alt="Kesuma Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-dots"></div>
                    <div class="loading-dots"></div>
                    <div class="loading-dots"></div>
                </div>
                </div>
                <span class="icon material-symbols-outlined">
                    content_copy
                </span>`;
    
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return;

    const html = `<div class="message-content">
                <img src="./assets/user.png" alt="User Image" class="avatar">
                <p class="text">Lorem ipsum dolor sit amet consectetur, adipisicing elit. </p>
                </div>`;
    
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;   
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    setTimeout(showLoadingAnimation, 500);
}

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});