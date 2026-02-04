import { Link } from 'react-router-dom';
import bikeLogo from '../../assets/bike-logo.png';
import './index.css';

export default function Footer({
    marketplaceLinks = [
        { label: 'All Bikes', href: '#' },
        { label: 'Road Bikes', href: '#' },
        { label: 'Mountain Bikes', href: '#' },
        { label: 'E-Bikes', href: '#' },
        { label: 'Components', href: '#' }
    ],
    servicesLinks = [
        { label: 'Inspection Pro', href: '#' },
        { label: 'Bike Shipping', href: '#' },
        { label: 'Sell Your Bike', href: '#' },
        { label: 'Bike Financing', href: '#' },
        { label: 'Trade-In Program', href: '#' }
    ],
    companyLinks = [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Help Center', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' }
    ],
    bottomLinks = [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Settings', href: '#' }
    ]
}) {
    return (
        <footer className="app-footer app-footer-light">
            <div className="app-footer-inner">
                <div className="app-footer-top">
                    <div>
                        <Link to="/" className="app-footer-logo">
                            <img src={bikeLogo} alt="BASAUYCLE" className="app-footer-logo-icon" />
                            <span className="app-footer-logo-text">BASAUYCLE</span>
                        </Link>
                        <p className="app-footer-description">
                            The premium destination for cyclists to buy and sell high-performance equipment with confidence and ease.
                        </p>
                        <div className="app-footer-social">
                            <a href="#" className="app-footer-social-icon" aria-label="Share">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </a>
                            <a href="#" className="app-footer-social-icon" aria-label="Location">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                            <a href="#" className="app-footer-social-icon" aria-label="Globe">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <div className="app-footer-title">Marketplace</div>
                        <div className="app-footer-links">
                            {marketplaceLinks.map((link) => (
                                <a key={link.label} href={link.href}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="app-footer-title">Services</div>
                        <div className="app-footer-links">
                            {servicesLinks.map((link) => (
                                <a key={link.label} href={link.href}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="app-footer-title">Company</div>
                        <div className="app-footer-links">
                            {companyLinks.map((link) => (
                                <a key={link.label} href={link.href}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="app-footer-bottom">
                    <div>© 2026 BASAUYCLE Inc. All rights reserved.</div>
                    <div className="app-footer-bottom-links">
                        {bottomLinks.map((link) => (
                            <a key={link.label} href={link.href}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
