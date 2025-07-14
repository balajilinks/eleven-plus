import React from 'react';
import './Breadcrumb.css';

function Breadcrumb({ currentPage, subject, category, concept, onNavigate }) {
    const breadcrumbItems = [];

    // Always show home
    breadcrumbItems.push({
        label: 'Home',
        onClick: () => onNavigate('home'),
        active: currentPage === 'home' && !subject
    });

    // Add current page if not home
    if (currentPage !== 'home') {
        breadcrumbItems.push({
            label: currentPage === 'mock-tests' ? 'Mock Tests' : 'Settings',
            onClick: () => onNavigate(currentPage),
            active: true
        });
    } else if (subject) {
        // Add subject
        breadcrumbItems.push({
            label: subject.charAt(0).toUpperCase() + subject.slice(1),
            onClick: () => onNavigate('home', subject),
            active: !category && !concept
        });

        // Add category if present
        if (category) {
            breadcrumbItems.push({
                label: category,
                onClick: () => onNavigate('home', subject, category),
                active: !concept
            });

            // Add concept if present
            if (concept) {
                breadcrumbItems.push({
                    label: concept,
                    onClick: null, // Current page, no navigation
                    active: true
                });
            }
        }
    }

    if (breadcrumbItems.length <= 1) {
        return null; // Don't show breadcrumb for single item
    }

    return (
        <nav className="breadcrumb">
            {breadcrumbItems.map((item, index) => (
                <span key={index} className="breadcrumb-item">
                    {index > 0 && <span className="breadcrumb-separator">›</span>}
                    {item.onClick ? (
                        <button
                            className={`breadcrumb-link ${item.active ? 'active' : ''}`}
                            onClick={item.onClick}
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

export default Breadcrumb;
