"use client";

import React, { useState } from 'react';

interface NomineeImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function NomineeImage({ src, alt, className = "" }: NomineeImageProps) {
    const [hasError, setHasError] = useState(false);
    const imageUrl = hasError ? "/nominee-placeholder.webp" : (src || "/nominee-placeholder.webp");

    const handleError = () => {
        setHasError(true);
    };

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}

