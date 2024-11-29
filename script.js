const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

// Put own API key over here
const API_URL = `https://6196-2001-e68-543a-c054-8065-5f4a-86a4-d541.ngrok-free.app/chat`;

//Store theme settings and chat in local storage
const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor")=== "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats); 
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom when response given
}

loadLocalstorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatList.innerHTML);
        }
        chatList.scrollTo(0, chatList.scrollHeight);

    }, 50);
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
        if(!response.ok) throw new Error(data.error.message);

        // Extract the chatbot's response from the 'response' key
        const apiResponse = data?.response || "No response found".replace(/\*\*(.*?)\*\*/g,'$1');

        //Show typing effect for AI response
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);

        return apiResponse; // Return the response if needed elsewhere
    } 
    catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
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
                <span onclick= "copyMessage(this)" class="icon material-symbols-outlined">
                    content_copy
                </span>`;
    
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom when response given
    generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;

    const html = `<div class="message-content">
                <img src="./assets/user.png" alt="User Image" class="avatar">
                <p class="text">Lorem ipsum dolor sit amet consectetur, adipisicing elit. </p>
                </div>`;
    
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;   
    chatList.appendChild(outgoingMessageDiv);
    
    typingForm.reset(); //Clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom when response given
    document.body.classList.add("hide-header"); // Hide the header once chat start
    setTimeout(showLoadingAnimation, 500);  // Show loading animation after a delay
}

// Light & Dark Mode Settings
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
})

suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});

//Delete chat button
deleteChatButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all messages?")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});