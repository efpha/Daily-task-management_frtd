import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  disabled = false,
  hint,
  error,
}) => {
  const isPassword = type === "password" || type === "text-password";
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap ${error ? "has-error" : ""}`}>
        <input
          id={id}
          name={id}
          type={isPassword ? (visible ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            tabIndex={disabled ? -1 : 0}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="auth-field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="auth-field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
};

export default AuthField;
