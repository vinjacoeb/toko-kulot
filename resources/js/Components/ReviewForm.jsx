import React, { useEffect, useState } from 'react';
import { cn } from '../lib/format';
import Button from './Button';
import Field from './Field';
import StarRating from './StarRating';
import Textarea from './Textarea';
import { ImageOffIcon } from './icons';

/**
 * Form ulasan per produk — design §4.29 dan §5.8, kontrak §9.1.
 * Bintang interaktif 32px, textarea 120px, tombol `primary`.
 * State: idle | submitting | submitted ("Terima kasih! Penilaianmu membantu pembeli lain.")
 * | error | already-reviewed.
 */
export default function ReviewForm({
    productId = null,
    product = null,
    rating = 0,
    submitting = false,
    submitted = false,
    alreadyReviewed = false,
    error = null,
    onSubmit = null,
    className = '',
}) {
    const [ratingValue, setRatingValue] = useState(Number(rating) || 0);
    const [comment, setComment] = useState('');
    const [localError, setLocalError] = useState(null);
    const [imageFailed, setImageFailed] = useState(false);

    const image = product?.image ?? null;
    const name = product?.name ?? 'Produk';
    const variantLabel = product?.variant_label ?? null;
    const textareaId = `ulasan-komentar-${productId ?? 'x'}`;

    useEffect(() => {
        setImageFailed(false);
    }, [image]);

    if (submitted || alreadyReviewed) {
        return (
            <section className={cn('card p-4 sm:p-5', className)} aria-label={`Penilaian ${name}`}>
                <div className="flex items-center gap-3">
                    <Thumb image={image && !imageFailed ? image : null} onError={() => setImageFailed(true)} />
                    <ProductTitle name={name} variantLabel={variantLabel} />
                </div>

                {ratingValue > 0 && (
                    <div className="mt-4">
                        <StarRating value={ratingValue} size="lg" readOnly label={`Rating ${ratingValue} dari 5`} />
                    </div>
                )}

                <p className="mt-3 text-body text-ink-soft">
                    {submitted
                        ? 'Terima kasih! Penilaianmu membantu pembeli lain.'
                        : 'Produk ini sudah kamu nilai pada pesanan ini.'}
                </p>
            </section>
        );
    }

    const submit = (event) => {
        event.preventDefault();

        if (ratingValue < 1) {
            setLocalError('Pilih jumlah bintang dulu.');
            return;
        }

        setLocalError(null);
        onSubmit?.({
            product_id: productId,
            rating: ratingValue,
            comment: comment.trim() === '' ? null : comment.trim(),
        });
    };

    const shownError = localError ?? error;

    return (
        <form className={cn('card p-4 sm:p-5', className)} onSubmit={submit} noValidate>
            <div className="flex items-center gap-3">
                <Thumb image={image && !imageFailed ? image : null} onError={() => setImageFailed(true)} />
                <ProductTitle name={name} variantLabel={variantLabel} />
            </div>

            <p className="mt-4 text-body text-ink">Seberapa puas kamu?</p>

            <div className="mt-2">
                <StarRating
                    value={ratingValue}
                    size="lg"
                    readOnly={false}
                    label={`Pilih rating untuk ${name}`}
                    onChange={(next) => {
                        setRatingValue(next);
                        setLocalError(null);
                    }}
                />
            </div>

            <Field
                label="Komentar (opsional)"
                htmlFor={textareaId}
                error={shownError}
                className="mt-4"
            >
                <Textarea
                    id={textareaId}
                    name={`ulasan[${productId ?? 0}][comment]`}
                    value={comment}
                    maxLength={1000}
                    placeholder="Tulis komentarmu…"
                    error={shownError}
                    disabled={submitting}
                    onChange={(event) => setComment(event.target.value)}
                />
            </Field>

            <div className="mt-4">
                <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
                    Kirim Penilaian
                </Button>
            </div>
        </form>
    );
}

function Thumb({ image, onError }) {
    return (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
            {image ? (
                <img src={image} alt="" width="64" height="64" className="h-full w-full object-cover" onError={onError} />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-slate-300" aria-hidden="true">
                    <ImageOffIcon size={24} />
                </span>
            )}
        </div>
    );
}

function ProductTitle({ name, variantLabel }) {
    return (
        <p className="min-w-0 text-h3 text-ink">
            {name}
            {variantLabel && <span className="text-meta font-normal text-slate-500"> · {variantLabel}</span>}
        </p>
    );
}
