import logo from './logo.png';

const Header = () => {
    const title = "BlockTrace";
    const userRole = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const allowedUsers = ["org1", "org2"];

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
                            <a href="/student-documents">My Documents</a>
                        </>
                    )}
                    <a href="/DocumentsByDate">Documents By Date</a>
                    <a href="/DocumentsByAlphabeticalOrder">Documents By Alphabetical Order</a>
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