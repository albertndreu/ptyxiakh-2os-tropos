import logo from './logo.png';

const Header = () => {
    const title = "BlockTrace";
    const userRole = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const allowedUsers = ["Grammateia", "Prutaneia"];

    return (
        <div className="header">
            <h1>{title}</h1>
            <img src={logo} alt="Logo" className="logo"/>
            <nav className="Navbar">     
                <div className="links">
                    <a href="/">Home</a>
                    {isLoggedIn && userRole === "organization" && allowedUsers.includes(username) && (
                        <>
                            <a href="/TransactionForm">Submit Documents</a>
                            <a href="/ViewRequests">View Requests</a>
                            <a href="/Documents">All Documents</a>
                        </>
                    )}
                    {isLoggedIn && userRole === "student" && (
                        <>
                            <a href="/RequestDocument">Request Documents</a>
                            <a href="/ValidateDocument">Document Validation</a>
                            <a href="/student-documents">My Documents</a>
                        </>
                    )}
                    {!isLoggedIn ? (
                        <a href="/Login">Login</a>
                    ) : (
                        <a href="/Login">Logout</a>
                    )}
                </div>
            </nav>
        </div>
    );
}

export default Header;