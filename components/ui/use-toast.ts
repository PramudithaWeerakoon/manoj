"use client";
import { toast as reactToastifyToast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast(options: ToastOptions) {
  // In a real implementation, this would show a toast notification
  console.log(`TOAST: ${options.title} - ${options.description || ''}`);
  
  // For now, we'll just use alert for simplicity
  alert(`${options.title}: ${options.description || ''}`);
}