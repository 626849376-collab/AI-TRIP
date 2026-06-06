"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "确认",
    cancelText = "取消",
    variant = "danger",
    isLoading = false,
}: ConfirmDialogProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "text-red-500",
            bg: "bg-red-50",
            button: "bg-red-500 hover:bg-red-600",
        },
        warning: {
            icon: "text-yellow-500",
            bg: "bg-yellow-50",
            button: "bg-yellow-500 hover:bg-yellow-600",
        },
        info: {
            icon: "text-blue-500",
            bg: "bg-blue-50",
            button: "bg-blue-500 hover:bg-blue-600",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                        <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors icon-button"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 touch-target"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all disabled:opacity-50 touch-target ${styles.button}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {confirmText}
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for using confirm dialog
export function useConfirm() {
    const [state, setState] = useState<{
        isOpen: boolean;
        resolve: ((value: boolean) => void) | null;
    }>({ isOpen: false, resolve: null });

    const confirm = useCallback(
        (title: string, message: string): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({ isOpen: true, resolve });
            });
        },
        []
    );

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState({ isOpen: false, resolve: null });
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState({ isOpen: false, resolve: null });
    }, [state.resolve]);

    return {
        confirm,
        ConfirmDialogComponent: state.isOpen ? (
            <ConfirmDialog
                isOpen={state.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title="确认"
                message="确定要执行此操作吗？"
            />
        ) : null,
    };
}