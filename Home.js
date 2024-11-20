import backgroundImage from './blockchain.png';
import decentralized from './Decentralization.jpg';
import blockgif from './blockgif.gif';

const Homepage = () => {
    return (
        <div>
            {/*first section*/}
            <section className="intro-section">
                <div className="intro-content">
                    <div className="text-content">
                        <h2>Revolutionizing Document Management</h2>
                        <p>
                            BlockTrace brings a new level of security and transparency to document handling. Leverage the power of blockchain for your peace of mind.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src={backgroundImage} alt="Blockchain Concept" />
                    </div>
                </div>
            </section>

    <section className="custom-card-section">
        <h2 className="section-title">Why Choose BlockTrace?</h2> 
    <div className="content-container">
        <div className="text-content1">
            <h2>Unique technology</h2>
            <p>BlockTrace uses decentralization technology that offers numerous advantages that enhance security, transparency, and user empowerment. Unlike traditional centralized systems, where a single entity holds control over data and processes, decentralized blockchain networks distribute power and responsibility among all participants.</p>
        </div>
        <div className="custom-card">
            <img src={decentralized} alt="decentralized" className="decentralized"/>
        </div>
    </div>
</section>

<section className="big-card-section">
    <div className="big-custom-card">
        <div className="big-card-content">
            <h3>Secure, Transparent Document Tracking.</h3>
            <h2>Submit Your Documents.</h2>
        </div>
        <div className="gif-container">
            <img src={blockgif} alt="blockgif" />
        </div>
    </div>
</section>


            <section className="hero-section">
                <div className="hero-content">
                    <h2>Secure, Transparent Document Tracking</h2>
                    <p>
                        Welcome to BlockTrace, the easiest way to submit, verify, and track documents using blockchain technology. Secure your documents with the power of decentralization.
                    </p>
                    <a href="/Login" className="cta-button">Get Started</a>
                </div>
            </section>

            <section className="features-section">
    <h2>Features</h2>
    <div className="features">
        <div className="feature">
            <h3>Blockchain Security</h3>
            <p>All documents are securely stored and verifiable through blockchain.</p>
        </div>
        <div className="feature">
            <h3>Transparency</h3>
            <p>Track every document and its verification process with full transparency.</p>
        </div>
        <div className="feature">
            <h3>Easy Submission</h3>
            <p>Quickly upload and submit documents in just a few clicks.</p>
        </div>
        <div className="feature">
            <h3>Decentralization</h3>
            <p>Control and manage your documents without relying on a central authority.</p>
        </div>
        <div className="feature">
            <h3>Improved Efficiency</h3>
            <p>Eliminate delays in document verification and approval processes.</p>
        </div>
        <div className="feature">
            <h3>Cost Savings</h3>
            <p>Reduce operational costs by minimizing paperwork and administrative overhead.</p>
        </div>
       
    </div>
</section>
        </div>
    );
}


/*
const fileInput = document.getElementById('file-input');
const uploadArea = document.querySelector('.file-upload');

// When clicking the area, trigger the file input click
uploadArea.addEventListener('click', () => fileInput.click());

// Add drag-and-drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    // Process the files here
});
*/
export default Homepage;
