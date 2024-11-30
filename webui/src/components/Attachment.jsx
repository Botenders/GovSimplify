import React, { useState } from "react";
import { Eye, X, Download } from "lucide-react";

const AttachmentPreview = ({ content }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const title = content.title || "Attachment";

    const openModal = () => {
        if (content.type !== "pdf") {
            setIsModalOpen(true);
            document.body.style.overflow = "hidden";
        } else {
            // Direct download for PDFs
            window.open(content.url, "_blank");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "unset";
    };

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 px-3 py-2 text-sm text-orange-700 
                    bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
            >
                {content.type === "pdf" ? (
                    <Download className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
                <span className="font-medium">{title}</span>
            </button>

            {isModalOpen && content.type !== "pdf" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl m-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-orange-900">
                                {title}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-orange-100 rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                            <div
                                className="prose max-w-none text-sm text-left [&>*]:text-left [&>*]:text-sm"
                                dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-orange-700 
                                    bg-orange-100 rounded-lg hover:bg-orange-200 
                                    focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AttachmentPreview;