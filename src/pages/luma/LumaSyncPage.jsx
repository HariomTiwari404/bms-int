'use client';

import React, { useId, useMemo, useState, useRef } from 'react';
import { ArrowUpRight, Copy, RotateCw } from 'lucide-react';
import lumaLogo from '../../assets/lumaLogo.svg';
import './LumaSyncPage.css';

const formatIstTime = () => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
};

const LUMA_API_BASE_URL = 'https://api2.luma.com';

const safeJsonParse = async response => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const callLumaAuthApi = async ({ path, body, method = 'POST' }) => {
  const response = await fetch(`${LUMA_API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'x-luma-client-type': 'luma-web',
      'x-luma-client-version': '0901ea7d5bb0c105e294cd3c8b5458c2fc1618b5',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await safeJsonParse(response);

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP ${response.status}`);
    if (payload?.error) {
      error.code = payload.error;
    }
    throw error;
  }

  return payload;
};

const requestVerificationCode = phoneNumber =>
  callLumaAuthApi({
    path: '/auth/sms/request-verification-code',
    body: { phone_number: phoneNumber },
  });

const verifyVerificationCode = ({ phoneNumber, verificationCode }) =>
  callLumaAuthApi({
    path: '/auth/sms/verify-verification-code',
    body: {
      phone_number: phoneNumber,
      verification_code: verificationCode,
    },
  });

const normalizePhoneNumber = (value, defaultCountryCode = '+91') => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^\d]/g, '');
    return digits ? `+${digits}` : '';
  }

  const digits = trimmed.replace(/\D/g, '');
  return digits ? `${defaultCountryCode}${digits}` : '';
};

const deriveLumaErrorMessage = (error, fallbackMessage) => {
  if (error?.message === 'Failed to fetch') {
    return 'Unable to reach Luma at the moment. Please try again.';
  }
  return error?.message || fallbackMessage;
};

const WelcomeDoorIcon = () => {
  const uniqueId = useId();
  const doorFrameId = `${uniqueId}-door-frame`;
  const arrowId = `${uniqueId}-door-arrow`;
  const doorOpenId = `${uniqueId}-door-open`;
  const maskId = `${uniqueId}-door-mask`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      className="h-7 w-7 text-white"
      aria-hidden
    >
      <defs>
        <path
          id={doorFrameId}
          d="M11.5 13.5C11.5 9.73 11.5 7.84 12.67 6.67C13.84 5.5 15.73 5.5 19.5 5.5C23.27 5.5 25.16 5.5 26.33 6.67C27.5 7.84 27.5 9.73 27.5 13.5C27.5 17.27 27.5 18.94 27.5 22.71C27.5 26.48 27.5 28.37 26.33 29.54C25.16 30.71 23.27 30.71 19.5 30.71C15.73 30.71 13.84 30.71 12.67 29.54C11.5 28.37 11.5 26.48 11.5 22.71C11.5 18.94 11.5 17.27 11.5 13.5Z"
        />
        <path id={arrowId} d="M2 18H7.5L3.21 13L7.5 18L3.21 23">
          <animate
            attributeName="d"
            begin="0ms"
            dur="600ms"
            fill="freeze"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.22 0.61 0.36 1"
            values="M2 18H7.5L3.21 13L7.5 18L3.21 23;M2 18H13.5L9.21 13L13.5 18L9.21 23"
          />
        </path>
        <path
          id={doorOpenId}
          d="M17.5 13.90C17.5 12.28 17.40 10.62 18.56 9.37C19.12 8.77 19.91 8.41 21.51 7.70C23.70 6.71 24.80 6.21 25.68 6.46C27.5 6.97 27.5 9.80 27.5 11.57C27.5 22.5 27.5 13 27.5 24.68C27.5 26.45 27.68 28.44 26.52 29.90C25.84 30.75 24.78 31.23 22.65 32.18C21.41 32.74 19.40 34.04 18.14 32.87C17.5 32.28 17.5 31.14 17.5 28.85C17.5 16 17.5 27.5 17.5 13.90Z"
        >
          <animate
            attributeName="d"
            begin="0ms"
            dur="600ms"
            fill="freeze"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.22 0.61 0.36 1"
            values="M11.5 13.5C11.5 9.73 11.5 7.84 12.67 6.67C13.84 5.5 15.73 5.5 19.5 5.5C23.27 5.5 25.16 5.5 26.33 6.67C27.5 7.84 27.5 9.73 27.5 13.5C27.5 17.27 27.5 18.94 27.5 22.71C27.5 26.48 27.5 28.37 26.33 29.54C25.16 30.71 23.27 30.71 19.5 30.71C15.73 30.71 13.84 30.71 12.67 29.54C11.5 28.37 11.5 26.48 11.5 22.71C11.5 18.94 11.5 17.27 11.5 13.5Z; M17.5 13.90C17.5 12.28 17.40 10.62 18.56 9.37C19.12 8.77 19.91 8.41 21.51 7.70C23.70 6.71 24.80 6.21 25.68 6.46C27.5 6.97 27.5 9.80 27.5 11.57C27.5 22.5 27.5 13 27.5 24.68C27.5 26.45 27.68 28.44 26.52 29.90C25.84 30.75 24.78 31.23 22.65 32.18C21.41 32.74 19.40 34.04 18.14 32.87C17.5 32.28 17.5 31.14 17.5 28.85C17.5 16 17.5 27.5 17.5 13.90Z"
          />
        </path>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <use
            xlinkHref={`#${doorFrameId}`}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
          <use
            xlinkHref={`#${arrowId}`}
            fill="none"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <use xlinkHref={`#${doorOpenId}`} fill="#000" />
        </mask>
      </defs>

      <use
        xlinkHref={`#${doorOpenId}`}
        fill="currentColor"
        fillOpacity=".133"
      />
      <use
        xlinkHref={`#${doorFrameId}`}
        mask={`url(#${maskId})`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <use
        xlinkHref={`#${doorOpenId}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <use
        xlinkHref={`#${arrowId}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 512 512" className="h-4 w-4" aria-hidden>
    <path
      fill="currentColor"
      d="M500 261.8C500 403.3 403.1 504 260 504 122.8 504 12 393.2 12 256S122.8 8 260 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C270.5 52.6 106.3 116.6 106.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H260v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4"
    />
  </svg>
);

const PasskeyIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
    <path
      fill="currentColor"
      d="M6.617 7.064a2.5 2.5 0 0 1-1.388-.406 3 3 0 0 1-1.014-1.102 3.2 3.2 0 0 1-.381-1.553 3.03 3.03 0 0 1 1.403-2.604A2.54 2.54 0 0 1 6.617 1q.747 0 1.377.392t1.015 1.07q.384.676.384 1.526 0 .864-.38 1.564a3 3 0 0 1-1.015 1.106 2.5 2.5 0 0 1-1.38.406Zm-4.636 6.424q-.57 0-.894-.253a.83.83 0 0 1-.322-.692q0-.675.407-1.41t1.168-1.38 1.842-1.052q1.08-.405 2.428-.406.937 0 1.747.209a6.8 6.8 0 0 1 1.468.553q.037.768.403 1.424t.996 1.073v1.934zm11.06-6.826q.614 0 1.124.3t.81.806q.3.504.3 1.12 0 .718-.425 1.286-.426.567-1.216.89l.893.893a.22.22 0 0 1 .074.158q0 .084-.059.142l-.916.901.652.652a.2.2 0 0 1 .066.147.2.2 0 0 1-.066.146l-1.098 1.099a.19.19 0 0 1-.143.062.2.2 0 0 1-.136-.062l-.586-.586a.35.35 0 0 1-.11-.242v-3.391a2.26 2.26 0 0 1-1.021-.824 2.2 2.2 0 0 1-.385-1.27q0-.617.3-1.121.3-.506.81-.806.509-.3 1.132-.3m-.008 1.025a.66.66 0 0 0-.487.201.66.66 0 0 0-.201.487q0 .285.205.488a.67.67 0 0 0 .483.201.67.67 0 0 0 .484-.201.66.66 0 0 0 .205-.488.66.66 0 0 0-.205-.487.67.67 0 0 0-.484-.201"
    />
  </svg>
);

const OTPInput = ({ length = 6, value = '', onChange, onComplete }) => {
  const inputs = Array.from({ length }, (_, i) => i);
  const refs = useRef([]);

  const handleChange = (idx, event) => {
    const digit = event.target.value.replace(/\D/g, '').slice(0, 1);
    const newValue = value.slice(0, idx) + digit + value.slice(idx + 1);
    onChange(newValue);

    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }

    if (newValue.length === length) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (idx, event) => {
    if (event.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = event => {
    event.preventDefault();
    const paste = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    onChange(paste);
    if (paste.length === length) onComplete(paste);
  };

  return (
    <div className="luma-otp-inputs" onPaste={handlePaste}>
      {inputs.map(i => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="luma-otp-input"
        />
      ))}
    </div>
  );
};

export default function LumaSyncPage() {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+91 ');
  const [error, setError] = useState('');
  const currentTime = useMemo(() => formatIstTime(), []);
  const [showOtp, setShowOtp] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpStatusMessage, setOtpStatusMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const resetOtpFlow = () => {
    setShowOtp(false);
    setOtp('');
    setOtpError('');
    setOtpStatusMessage('');
    setPhoneForOtp('');
    setResending(false);
    setIsVerifyingOtp(false);
  };

  const toggleMode = () => {
    setMode(p => (p === 'email' ? 'mobile' : 'email'));
    setError('');
  };

  const handleContinue = async event => {
    event.preventDefault();
    const value = mode === 'email' ? email.trim() : mobile.trim();

    if (!value) {
      setError(
        `Please enter a ${mode === 'email' ? 'valid email address' : 'mobile number'}.`,
      );
      return;
    }
    if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (mode === 'mobile' && value.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setError('');

    if (mode === 'email') {
      alert(`Demo: continuing with email ${value}`);
      return;
    }

    const e164 = normalizePhoneNumber(value);

    if (!e164) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setIsRequestingCode(true);
    setOtp('');
    setOtpError('');
    setOtpStatusMessage('');

    try {
      await requestVerificationCode(e164);
      setPhoneForOtp(e164);
      setShowOtp(true);
      setOtpStatusMessage('Code sent successfully.');
    } catch (err) {
      console.error(err);
      setError(deriveLumaErrorMessage(err, 'Failed to send code. Try again.'));
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResend = async () => {
    if (!phoneForOtp || resending) {
      return;
    }

    setResending(true);
    setOtpStatusMessage('');
    setOtpError('');

    try {
      await requestVerificationCode(phoneForOtp);
      setOtpStatusMessage('Code resent successfully.');
    } catch (err) {
      console.error(err);
      setOtpError(deriveLumaErrorMessage(err, 'Failed to resend code.'));
    } finally {
      setResending(false);
    }
  };

  const handleOtpComplete = async code => {
    if (!phoneForOtp || !code) {
      return;
    }

    setOtpError('');
    setOtpStatusMessage('');
    setIsVerifyingOtp(true);

    try {
      const data = await verifyVerificationCode({
        phoneNumber: phoneForOtp,
        verificationCode: code,
      });

      console.info('Luma verification response', data);
      setOtpStatusMessage('Phone verified successfully.');
    } catch (err) {
      console.error(err);
      setOtpError(deriveLumaErrorMessage(err, 'Invalid code.'));
      setOtp('');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSocial = provider => {
    alert(`${provider} sign-in coming soon`);
  };

  return (
    <div className="luma-sync">
      <div className="luma-sync__background">
        <div className="luma-sync__gradient" />
        <div className="luma-sync__glow luma-sync__glow--one" />
        <div className="luma-sync__glow luma-sync__glow--two" />
        <div className="luma-sync__glow luma-sync__glow--three" />
      </div>

      <header className="luma-header">
        <img src={lumaLogo} alt="Luma" className="luma-header__logo" />
        <div className="luma-header__actions">
          <span className="luma-header__time">{currentTime} IST</span>
          <a
            href="https://luma.com/discover"
            target="_blank"
            rel="noreferrer"
            className="luma-link"
          >
            Explore Events
            <ArrowUpRight size={14} />
          </a>
          <a
            href="https://luma.com/signin"
            target="_blank"
            rel="noreferrer"
            className="luma-pill"
          >
            Sign In
          </a>
        </div>
      </header>

      <main className="luma-main">
        {!showOtp && (
          <form onSubmit={handleContinue} className="luma-card">
            <div className="luma-card__hero">
              <div className="luma-card__icon">
                <WelcomeDoorIcon />
              </div>
              <div>
                <p className="luma-card__heading">Welcome to Luma</p>
                <p className="luma-card__caption">
                  Please sign in or sign up below.
                </p>
              </div>
            </div>

            <div className="luma-card__field-group">
              <div className="luma-card__label-row">
                <label className="luma-card__label">
                  {mode === 'email' ? 'Email' : 'Mobile Number'}
                </label>
                <div className="luma-toggle-group">
                  <button
                    type="button"
                    onClick={toggleMode}
                    aria-pressed={mode === 'mobile'}
                    className={`luma-toggle ${mode === 'mobile' ? 'luma-toggle--active' : ''}`}
                  >
                    <span className="luma-toggle__thumb" />
                  </button>
                  <span className="luma-toggle__label">
                    {mode === 'email' ? 'Use Mobile Number' : 'Use Email'}
                  </span>
                </div>
              </div>

              {mode === 'email' ? (
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="luma-input"
                />
              ) : (
                <input
                  type="tel"
                  inputMode="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 81234 56789"
                  className="luma-input"
                />
              )}

              {error && <p className="luma-text luma-text--error">{error}</p>}

              <button
                type="submit"
                disabled={mode === 'mobile' && isRequestingCode}
                className="luma-button luma-button--primary"
              >
                {mode === 'mobile' && isRequestingCode
                  ? 'Sending code...'
                  : `Continue with ${mode === 'email' ? 'Email' : 'Mobile'}`}
              </button>
            </div>

            <div className="luma-card__divider">
              <button
                type="button"
                onClick={() => handleSocial('Google')}
                className="luma-button luma-button--social"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocial('Passkey')}
                className="luma-button luma-button--social"
              >
                <PasskeyIcon />
                Sign in with Passkey
              </button>
            </div>
          </form>
        )}

        {showOtp && (
          <div className="luma-otp-modal" role="dialog" aria-modal="true">
            <div className="luma-otp-modal__card">
              <div className="luma-otp-modal__header">
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="luma-button luma-button--ghost"
                >
                  ←
                </button>
                <h2>Enter Code</h2>
                <div className="luma-otp-modal__spacer" />
              </div>

              <p className="luma-otp-modal__caption">
                We sent a code to{' '}
                <span className="luma-otp-modal__highlight">{phoneForOtp}</span>{' '}
                via WhatsApp. Please enter it below.
              </p>

              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleOtpComplete}
              />

              {isVerifyingOtp && (
                <p className="luma-text luma-text--muted">Verifying code...</p>
              )}
              {otpError && (
                <p className="luma-text luma-text--error">{otpError}</p>
              )}
              {otpStatusMessage && (
                <p className="luma-text luma-text--success">
                  {otpStatusMessage}
                </p>
              )}

              <div className="luma-otp-modal__actions">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="luma-button luma-button--ghost"
                >
                  {resending ? (
                    <RotateCw className="luma-icon luma-icon--spin" />
                  ) : (
                    <Copy className="luma-icon" />
                  )}
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="luma-button luma-button--ghost"
                >
                  Change Number
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
