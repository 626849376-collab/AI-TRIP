"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Search, Trash2, Loader2 } from "lucide-react";
import { getCurrentUser, getAllUsers, deleteUser } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function AdminUsersPage() {
    const { user, setUser } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useLanguageStore();
    const t = translations[language];

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    window.location.href = "/auth/login";
                    return;
                }
                setUser(currentUser);
                const allUsers = await getAllUsers();
                setUsers(allUsers);
            } catch (error) {
                toast.error(t.admin.loadFailed);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [setUser, t.admin.loadFailed]);

    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{t.admin.back}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold">{t.admin.users}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t.admin.searchUsers}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                        {t.admin.name}
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                        {t.admin.email}
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                        {t.admin.registerTime}
                                    </th>
                                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                                        {t.admin.actions}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {u.name || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatDate(u.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={async () => {
                                                    if (
                                                        !confirm(
                                                            t.admin
                                                                .deleteConfirm
                                                        )
                                                    )
                                                        return;
                                                    try {
                                                        await deleteUser(
                                                            u.id
                                                        );
                                                        setUsers(
                                                            users.filter(
                                                                (x) =>
                                                                    x.id !==
                                                                    u.id
                                                            )
                                                        );
                                                        toast.success(
                                                            t.admin
                                                                .deleteSuccess
                                                        );
                                                    } catch (error: any) {
                                                        toast.error(
                                                            t.admin
                                                                .deleteFailed
                                                        );
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title={t.admin.delete}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                {t.admin.noUsers}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
