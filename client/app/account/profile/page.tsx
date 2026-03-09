"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  useProfile,
  useUpdateProfile,
  useUpdatePassword,
  useDeleteAccount,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/use-profile";
import { api } from "@/lib/axios";
import type { Address } from "@/types/api";

type AddressForm = Omit<Address, "id" | "is_default">;

const EMPTY_ADDRESS: AddressForm = {
  type: "shipping",
  first_name: "",
  last_name: "",
  company: null,
  address_line_1: "",
  address_line_2: null,
  city: "",
  state: null,
  postal_code: "",
  country_code: "PL",
  phone: null,
};

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: savingProfile } = useUpdateProfile();
  const { mutate: updatePassword, isPending: savingPassword } = useUpdatePassword();
  const { mutate: deleteAccount, isPending: deletingAccount } = useDeleteAccount();

  const { data: addresses = [] } = useAddresses();
  const { mutate: createAddress, isPending: addingAddress } = useCreateAddress();
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: setDefault } = useSetDefaultAddress();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressForm>({ ...EMPTY_ADDRESS });
  const [exportingData, setExportingData] = useState(false);

  async function handleExportData() {
    setExportingData(true);
    try {
      const response = await api.get("/profile/export", { responseType: "blob" });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingData(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      name: profileForm.name || profile?.name || "",
      email: profileForm.email || profile?.email || "",
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePassword(passwordForm, {
      onSuccess: () =>
        setPasswordForm({ current_password: "", password: "", password_confirmation: "" }),
    });
  }

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    createAddress(newAddress, {
      onSuccess: () => {
        setShowAddAddress(false);
        setNewAddress({ ...EMPTY_ADDRESS });
      },
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* ── Personal info ─────────────────────────────────────────── */}
      <section className="rounded-xl border border-border p-6">
        <h2 className="mb-4 text-base font-semibold">Personal information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                defaultValue={profile?.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                defaultValue={profile?.email}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* ── Change password ───────────────────────────────────────── */}
      <section className="rounded-xl border border-border p-6">
        <h2 className="mb-4 text-base font-semibold">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Current password</label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, current_password: e.target.value }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, password: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm new password</label>
              <input
                type="password"
                required
                value={passwordForm.password_confirmation}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    password_confirmation: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {savingPassword ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>

      {/* ── Addresses ─────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Saved addresses</h2>
          <button
            onClick={() => setShowAddAddress((v) => !v)}
            className="text-sm font-medium text-primary hover:opacity-80"
          >
            {showAddAddress ? "Cancel" : "+ Add address"}
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={handleAddAddress} className="mb-6 space-y-3 rounded-lg bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">First name *</label>
                <input
                  required
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress((p) => ({ ...p, first_name: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Last name *</label>
                <input
                  required
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress((p) => ({ ...p, last_name: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Street address *</label>
                <input
                  required
                  value={newAddress.address_line_1}
                  onChange={(e) => setNewAddress((p) => ({ ...p, address_line_1: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Postal code *</label>
                <input
                  required
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress((p) => ({ ...p, postal_code: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">City *</label>
                <input
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Country code *</label>
                <input
                  required
                  maxLength={2}
                  value={newAddress.country_code}
                  onChange={(e) => setNewAddress((p) => ({ ...p, country_code: e.target.value.toUpperCase() }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
                <input
                  type="tel"
                  value={newAddress.phone ?? ""}
                  onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value || null }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingAddress}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {addingAddress ? "Saving…" : "Save address"}
            </button>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved addresses.</p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex items-start justify-between rounded-lg border border-border p-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {addr.first_name} {addr.last_name}
                    {addr.is_default && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">{addr.address_line_1}</p>
                  <p className="text-muted-foreground">
                    {addr.postal_code} {addr.city}, {addr.country_code}
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  {!addr.is_default && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="text-primary hover:opacity-80"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-destructive hover:opacity-80"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Danger zone ───────────────────────────────────────────── */}
      <section className="rounded-xl border border-destructive/30 p-6">
        <h2 className="mb-2 text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            disabled={exportingData}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {exportingData ? "Downloading…" : "Download my data"}
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account? This cannot be undone.",
                )
              ) {
                deleteAccount();
              }
            }}
            disabled={deletingAccount}
            className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {deletingAccount ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </section>
    </div>
  );
}
