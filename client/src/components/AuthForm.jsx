import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_URL);

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const endpoint = isRegistering ? "register" : "login";

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...(isRegistering && { name }),
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      onAuthenticated(data.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode() {
    setMode(isRegistering ? "login" : "register");
    setName("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Momentum</h1>

        <h2>{isRegistering ? "Create your account" : "Welcome back"}</h2>

        <p>
          {isRegistering
            ? "Create an account to start turning your goals into action."
            : "Log in to continue building momentum."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="8"
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <button type="button" className="auth-switch" onClick={changeMode}>
          {isRegistering
            ? "Already have an account? Log in"
            : "New to Momentum? Create an account"}
        </button>
      </section>
    </main>
  );
}

export default AuthForm;
