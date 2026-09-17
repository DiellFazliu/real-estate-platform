"use client";

import { FormEvent, useState } from "react";

type ProfileFormProps = {
  user: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    bio: string | null;
    image: string | null;
    roleName: string;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setMessage("Profile updated successfully.");
    } catch {
      setError("Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-grid">
      {/* Profile summary */}
      <section className="profile-card profile-summary">
        <div className="profile-avatar">
          {user.image ? (
            <img src={user.image} alt={user.name ?? "Profile"} />
          ) : (
            <span>
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h2>{user.name || "User"}</h2>

        <p className="profile-email">{user.email}</p>

        <span className="role-badge">
          {user.roleName}
        </span>
      </section>

      {/* Edit profile */}
      <section className="profile-card">
        <div className="card-header">
          <h2>Personal Information</h2>
          <p>Update your personal information below.</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <small>
              Changing your email may require email verification later.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number</label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+383 44 123 456"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={5}
            />
          </div>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
}