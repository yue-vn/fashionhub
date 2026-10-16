// src/pages/api/orders.ts
const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return url.endsWith('/api') ? url : `${url}/api`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchOrders = async (search: string = '') => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/Orders${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        headers: {
            ...getAuthHeaders(),
        },
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
};

export const approveOrder = async (id: number) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/Orders/approve/${id}`, {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
        },
    });
    if (!response.ok) throw new Error('Failed to approve order');
    return response.json();
};

export const cancelOrder = async (id: number, lyDoHuy: string) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/Orders/cancel/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(lyDoHuy),
    });
    if (!response.ok) throw new Error('Failed to cancel order');
    return response.json();
};