"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getBlogCategories,
  getBlogPost,
  getBlogPosts,
  getBrands,
  getCategories,
  getCategory,
  getFaqs,
  getMenu,
  getPage,
} from "@/api/cms";

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["pages", slug],
    queryFn: () => getPage(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenu(location: string) {
  return useQuery({
    queryKey: ["menus", location],
    queryFn: () => getMenu(location),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["categories", slug],
    queryFn: () => getCategory(slug),
    enabled: !!slug,
  });
}

export function useBlogPosts(params: { page?: number; category?: string } = {}) {
  return useQuery({
    queryKey: ["blog", "posts", params],
    queryFn: () => getBlogPosts(params),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", "posts", slug],
    queryFn: () => getBlogPost(slug),
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog", "categories"],
    queryFn: getBlogCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: getFaqs,
    staleTime: 10 * 60 * 1000,
  });
}
