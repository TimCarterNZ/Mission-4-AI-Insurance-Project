import styles from "./App.module.css";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function App() {
    const [chatStarted, setChatStarted] = useState(false);
    const [userMessage, setUserMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const latestMessageRef = useRef(null);
    const inputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);

    useEffect(() => {
        latestMessageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [messages]);

    useEffect(() => {
        if (chatStarted && !isLoading && !interviewComplete) {
            inputRef.current?.focus();
        }
    }, [chatStarted, isLoading, interviewComplete]);

    function handleChatToggle() {
        if (chatStarted) {
            setChatStarted(false);
            setMessages([]);
            setUserMessage("");
            setInterviewComplete(false);
            return;
        }

        setChatStarted(true);
        setMessages([
            {
                role: "agent",
                content:
                    "Hello, I am Tina! I am here to help you choose the right insurance policy. May I ask you some questions about your vehicle to make sure I recommend the best policy for you?",
            },
        ]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setInterviewComplete(false);

        if (!chatStarted || !userMessage.trim()) return;

        const message = userMessage.trim();

        // Adds the user's message to the conversation
        setMessages((previousMessages) => [
            ...previousMessages,
            { role: "user", content: message },
        ]);

        setUserMessage("");

        // Converts the React messages into Gemini's format
        const history = messages.map((item) => ({
            role: item.role === "agent" ? "model" : "user",
            parts: [{ text: item.content }],
        }));

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:4000/api/tina", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                    history: history,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get a response from Tina.");
            }

            const data = await response.json();

            // Displays Tina's reply
            setMessages((previousMessages) => [
                ...previousMessages,
                { role: "agent", content: data.reply },
            ]);

            if (data.interviewComplete === true) {
                setInterviewComplete(true);
            }
        } catch (error) {
            console.error(error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "agent",
                    content: "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <header className={styles["site-header"]}>
                {/* -------------------------------------------------------------------------- */}

                <nav
                    className={styles["header-top-menu"]}
                    aria-label="Site categories"
                >
                    <a href="https://www.turners.co.nz/Cars/">Cars</a>
                    <a href="https://www.turners.co.nz/Trucks-Machinery/">
                        Trucks &amp; Machinery
                    </a>
                    <a href="https://www.turners.co.nz/Damaged-Vehicles/">
                        Damaged &amp; End of Life
                    </a>
                    <a href="https://www.turners.co.nz/Motorcycles/">
                        Motorcycles
                    </a>
                    <a href="https://www.turners.co.nz/General-Goods/">
                        General Goods
                    </a>
                    <a href="https://www.turners.co.nz/Buses-Caravans/">
                        Buses, Caravans &amp; Motorhomes
                    </a>
                    <a href="https://www.turners.co.nz/Boats-Marine/">
                        Boats &amp; Marine
                    </a>
                </nav>

                {/* -------------------------------------------------------------------------- */}
                <div className={styles["header-container"]}>
                    <a
                        href="https://www.turners.co.nz/Cars/"
                        className={styles["logo"]}
                    >
                        <img
                            src="https://content.tgstatic.co.nz/webassets/contentassets/3e15c8546917474ca0a150b18e9fd64e/turnerscars_logo_1line_horz_true-rgb-desktop.png"
                            alt="Turners Cars"
                        />
                    </a>

                    {/* -------------------------------------------------------------------------- */}

                    <nav
                        className={styles["header-actions"]}
                        aria-label="Account and contact"
                    >
                        <a
                            href="https://www.turners.co.nz/"
                            className={styles["login-link"]}
                        >
                            <span
                                className={styles["header-icon"]}
                                aria-hidden="true"
                            >
                                ♟
                            </span>
                            <strong>LOGIN</strong> OR <strong>REGISTER</strong>
                        </a>

                        <a
                            href="tel:0800887637"
                            className={styles["phone-link"]}
                        >
                            <span
                                className={styles["header-icon"]}
                                aria-hidden="true"
                            >
                                ☎
                            </span>
                            0800 887 637
                        </a>

                        <a
                            href="https://www.turners.co.nz/"
                            className={styles["find-us-link"]}
                        >
                            <span
                                className={styles["header-icon"]}
                                aria-hidden="true"
                            >
                                ●
                            </span>
                            Find Us
                        </a>

                        <a
                            href="https://www.turners.co.nz/"
                            className={styles["language-link"]}
                        >
                            中文
                        </a>
                    </nav>
                </div>
            </header>

            {/* -------------------------------------------------------------------------- */}

            <nav
                className={styles["main-nav"]}
                aria-label="Main site navigation"
            >
                <div className={styles["main-nav-container"]}>
                    <div className={styles["main-nav-left"]}>
                        <a href="https://www.turners.co.nz/Cars/">
                            <span aria-hidden="true">🔍︎</span> Find a Car
                        </a>

                        <a href="https://www.turners.co.nz/Cars/">
                            How to Buy
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>

                        <a href="https://www.turners.co.nz/Cars/">
                            Sell your Car
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>

                        <a href="https://www.turners.co.nz/Cars/finance-insurance/car-insurance/">
                            Finance &amp; Insurance
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>

                        <a href="https://www.turners.co.nz/Cars/">
                            Mobile Servicing
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>
                    </div>

                    <div className={styles["main-nav-right"]}>
                        <a href="https://www.turners.co.nz/Cars/">
                            Auctions
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>

                        <a href="https://www.turners.co.nz/Cars/">
                            More Info
                            <span
                                className={styles["nav-arrow"]}
                                aria-hidden="true"
                            ></span>
                        </a>
                    </div>
                </div>
            </nav>
            {/* -------------------------------------------------------------------------- */}

            <main className={styles["main-container"]}>
                <div className={styles["breadcrumb"]}>
                    Insurance / AI Consultation
                </div>

                <section className={styles["intro"]}>
                    <p className={styles["section-label"]}>TURNERS INSURANCE</p>

                    <h1>Meet Tina, Your AI Insurance Consultant!</h1>

                    <p>
                        Chat with Tina to explore which insurance policy might
                        suit your vehicle and your needs.
                    </p>
                </section>

                {/* Insurance consultation */}

                <section className={styles["card"]}>
                    <div className={styles["consultation-container"]}>
                        <button
                            type="button"
                            className={`${styles["primary-button"]} ${
                                chatStarted ? styles["stop-button"] : ""
                            }`}
                            onClick={handleChatToggle}
                        >
                            {chatStarted
                                ? "Click here to reset your consultation"
                                : "Click here to begin your consultation"}
                        </button>
                    </div>
                    {/* Conversation Window */}
                    <div className={styles["chat-container"]}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`${styles["chat-message"]} ${
                                    message.role === "user"
                                        ? styles["user-message"]
                                        : styles["agent-message"]
                                }`}
                                ref={
                                    index === messages.length - 1
                                        ? latestMessageRef
                                        : null
                                }
                            >
                                <strong>
                                    {message.role === "agent"
                                        ? "Tina: "
                                        : "You: "}
                                </strong>

                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        ))}
                        {isLoading && (
                            <div
                                className={`${styles["chat-message"]} ${styles["agent-message"]}`}
                            >
                                <strong>Tina:</strong>
                                <div className={styles["loading-row"]}>
                                    <span>Thinking...</span>
                                    <span
                                        className={styles["loading-spinner"]}
                                    ></span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* User Input */}
                    {interviewComplete && (
                        <div className={styles["consultation-complete"]}>
                            <strong>Consultation complete</strong>
                            <p>Thank you for speaking with Tina.</p>
                        </div>
                    )}
                    {!interviewComplete && (
                        <form
                            className={`${styles["chat-form"]} ${
                                !chatStarted ? styles["chat-hidden"] : ""
                            }`}
                            onSubmit={handleSubmit}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                id="chat-input"
                                className={styles["chat-input"]}
                                placeholder="Type your message to Tina..."
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                disabled={interviewComplete || isLoading}
                            />

                            <button
                                type="submit"
                                className={styles["primary-button"]}
                                disabled={
                                    interviewComplete ||
                                    isLoading ||
                                    !userMessage.trim()
                                }
                            >
                                Submit
                            </button>
                        </form>
                    )}
                </section>
            </main>

            {/* -------------------------------------------------------------------------- */}

            <footer className={styles["site-footer"]}>
                <p>
                    This is a prototype built for an assignment for
                    demonstration purposes only.
                </p>
                <p>Not affiliated with or endorsed by Turners.</p>
            </footer>
        </div>
    );
}

export default App;
