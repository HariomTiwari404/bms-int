import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BmsSyncPage.css';
import bmsLogo from '../../assets/bmsLogo.png';
import deviceLaptop from '../../assets/DeviceLaptop.png';
import clockIcon from '../../assets/clock.png';
import monitorIcon from '../../assets/monitor.png';

const benefits = [
  {
    title: 'Quick & easy registration',
    description:
      'Complete your registration with just your PAN card and bank details.',
    icon: deviceLaptop,
  },
  {
    title: 'Take your events live superfast!',
    description:
      'Publish your event within just 15 minutes. Add event details, dates, and tickets — your event is ready.',
    icon: clockIcon,
  },
  {
    title: 'Monitor analytics & insights',
    description:
      'Track event sales, daily ticketing, and get real-time insights to stay on top of performance.',
    icon: monitorIcon,
  },
];

const FUNCTIONS_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_FUNCTIONS_URL ||
      'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions';

const callNetlifyFunction = async (functionName, payload) => {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.');
    if (data?.errors?.code) {
      error.code = data.errors.code;
    }
    throw error;
  }

  return data;
};

const BmsSyncPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpRequestError, setOtpRequestError] = useState('');
  const [otpRequestMessage, setOtpRequestMessage] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVerificationError, setOtpVerificationError] = useState('');
  const [isPasswordLoginInProgress, setIsPasswordLoginInProgress] =
    useState(false);
  const [passwordLoginError, setPasswordLoginError] = useState('');
  const [otpLimitExceeded, setOtpLimitExceeded] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState('');

  const isValidMobile = /^\d{10}$/.test(mobileNumber);
  const isLoginDisabled = !isValidMobile || !password;
  const isOtpDisabled = !otp;
  const isOtpOptionDisabled = !isValidMobile;

  const handlePasswordLogin = async () => {
    if (isLoginDisabled || isPasswordLoginInProgress) {
      return;
    }

    setIsPasswordLoginInProgress(true);
    setPasswordLoginError('');
    setOtpRequestError('');
    setOtpRequestMessage('');
    setOtpVerificationError('');
    setProfileFetchError('');
    setProfileName('');

    try {
      const responsePayload = await callBookMyShowTokenApi({
        username: mobileNumber,
        password,
        grantType: 'password',
      });

      const tokens = responsePayload?.data;
      await finalizeSync(tokens);
    } catch (error) {
      setPasswordLoginError(
        error?.message === 'Failed to fetch'
          ? 'Unable to reach BookMyShow. Please try again.'
          : error?.message || 'Unable to login with password.',
      );
    } finally {
      setIsPasswordLoginInProgress(false);
    }
  };

  const maskMobileNumber = value => {
    if (!value) {
      return '';
    }
    return value.replace(/.(?=.{2})/g, '*');
  };

  const callBookMyShowTokenApi = body =>
    callNetlifyFunction('bms-token', body);

  const requestOtp = async () => {
    if (!isValidMobile || isSendingOtp) {
      return;
    }

    setIsSendingOtp(true);
    setOtpRequestError('');
    setOtpRequestMessage('');
    setOtpVerificationError('');
    setPasswordLoginError('');
    setOtpLimitExceeded(false);
    setProfileFetchError('');
    setProfileName('');

    try {
      await callBookMyShowTokenApi({
        mobileNumber,
        grantType: 'login_otp',
      });

      setOtpRequestMessage('OTP sent successfully.');
      setView('otp');
    } catch (error) {
      if (error?.code === 'ERR.AUTH.LIMIT_EXCEEDED') {
        setOtpLimitExceeded(true);
      }
      setOtpRequestError(
        error?.message === 'Failed to fetch'
          ? 'Unable to reach BookMyShow. Please try again.'
          : error?.message || 'Unable to send OTP.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const sendTokensToTaar = async tokens => {
    if (!tokens) {
      return;
    }

    // TODO: Replace stub with actual Taar API integration to persist BookMyShow tokens.
    return Promise.resolve(tokens);
  };

  const fetchBmsProfile = async accessToken => {
    if (!accessToken) {
      throw new Error('Missing access token');
    }

    setIsFetchingProfile(true);
    setProfileFetchError('');

    try {
      const payload = await callNetlifyFunction('bms-profile', {
        accessToken,
      });
      const profile = payload?.data || {};
      const fullName =
        [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
        profile.username ||
        '';
      setProfileName(fullName);
    } catch (error) {
      setProfileFetchError('Unable to fetch profile information.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const finalizeSync = async tokens => {
    await sendTokensToTaar(tokens);
    await fetchBmsProfile(tokens?.accessToken);
    setSyncSuccess(true);
  };

  const handleVerifyOtp = async () => {
    if (isOtpDisabled || isVerifyingOtp) {
      return;
    }

    setIsVerifyingOtp(true);
    setOtpVerificationError('');

    try {
      const responsePayload = await callBookMyShowTokenApi({
        otp,
        grantType: 'login_otp',
        mobileNumber,
        isLoginWithOtp: true,
      });

      const tokens = responsePayload?.data;
      await finalizeSync(tokens);
    } catch (error) {
      setOtpVerificationError(
        error?.message === 'Failed to fetch'
          ? 'Unable to reach BookMyShow. Please try again.'
          : error?.message || 'Unable to verify OTP.',
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="bms-sync">
      <section className="bms-benefits">
        <div className="bms-benefits__inner">
          <h1 className="bms-benefits__title">
            Benefits of using Do It Yourself — our new event management tool
          </h1>
          <div className="bms-benefits__list">
            {benefits.map(benefit => (
              <div key={benefit.title} className="bms-benefit">
                <div className="bms-benefit__icon">
                  <img
                    src={benefit.icon}
                    alt={benefit.title}
                    className="bms-benefit__icon-img"
                  />
                </div>
                <div>
                  <h2 className="bms-benefit__heading">{benefit.title}</h2>
                  <p className="bms-benefit__description">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bms-auth">
        <div className="bms-card">
          <div className="bms-card__logo">
            <img src={bmsLogo} alt="BookMyShow logo" />
            <span>Do It Yourself</span>
          </div>

          {syncSuccess ? (
            <div className="bms-success">
              <div className="bms-alert bms-alert--success">
                {isFetchingProfile ? (
                  <p className="bms-success__loading">Fetching profile…</p>
                ) : (
                  <>
                    {profileName ? (
                      <p className="bms-success__name">{profileName}</p>
                    ) : (
                      <p className="bms-success__title">Sync completed</p>
                    )}
                    <p className="bms-success__caption">
                      Your BookMyShow account is now linked with Taar.
                    </p>
                    {!!profileFetchError && (
                      <p className="bms-error bms-error--inline">
                        {profileFetchError}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate('/o/dashboard-overview')}
                className="bms-button bms-button--primary"
              >
                Go to dashboard
              </button>
            </div>
          ) : view === 'login' ? (
            <div className="bms-form">
              <div className="bms-form-group">
                <label htmlFor="mobile-number" className="bms-label">
                  Mobile no.
                </label>
                <input
                  id="mobile-number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter mobile no."
                  value={mobileNumber}
                  onChange={event => {
                    setMobileNumber(event.target.value);
                    setOtpLimitExceeded(false);
                    setProfileName('');
                    setProfileFetchError('');
                  }}
                  className="bms-input"
                />
              </div>

              <div className="bms-form-group">
                <label htmlFor="password" className="bms-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="bms-input"
                />
                <div className="bms-form__inline-action">
                  <button type="button" className="bms-button bms-button--text">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoginDisabled || isPasswordLoginInProgress}
                onClick={handlePasswordLogin}
                className="bms-button bms-button--primary"
              >
                {isPasswordLoginInProgress ? 'Logging in…' : 'Proceed'}
              </button>
              {!!passwordLoginError && (
                <p className="bms-error">{passwordLoginError}</p>
              )}

              <div className="bms-otp-option">
                <button
                  type="button"
                  onClick={async () => {
                    setSyncSuccess(false);
                    await requestOtp();
                  }}
                  disabled={
                    isOtpOptionDisabled || isSendingOtp || otpLimitExceeded
                  }
                  className="bms-button bms-button--link"
                >
                  {otpLimitExceeded
                    ? 'OTP limit reached'
                    : isSendingOtp
                      ? 'Sending OTP…'
                      : 'Login with OTP'}
                </button>
                {!!otpRequestError && (
                  <p className="bms-error">{otpRequestError}</p>
                )}
                {!!otpRequestMessage && (
                  <p className="bms-note bms-note--success">
                    {otpRequestMessage}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bms-form bms-form--otp">
              <p className="bms-note">
                We have shared an OTP to{' '}
                <span className="bms-note__highlight">
                  {maskMobileNumber(mobileNumber)}
                </span>
              </p>
              {!!otpRequestError && (
                <div className="bms-alert bms-alert--error">
                  {otpRequestError}
                </div>
              )}
              {!!otpRequestMessage && (
                <div className="bms-alert bms-alert--success">
                  {otpRequestMessage}
                </div>
              )}
              {!!otpVerificationError && (
                <div className="bms-alert bms-alert--error">
                  {otpVerificationError}
                </div>
              )}

              <div className="bms-form-group">
                <label htmlFor="otp" className="bms-label">
                  One-time password
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={event => setOtp(event.target.value)}
                  className="bms-input bms-input--otp"
                />
                <div className="bms-helper-text">
                  Resend OTP in <span>00:20</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isOtpDisabled || isVerifyingOtp}
                onClick={handleVerifyOtp}
                className="bms-button bms-button--primary"
              >
                {isVerifyingOtp ? 'Verifying…' : 'Verify'}
              </button>

              <div className="bms-otp-option">
                <button
                  type="button"
                  onClick={() => {
                    setSyncSuccess(false);
                    setView('login');
                    setOtpRequestError('');
                    setOtpRequestMessage('');
                    setOtpVerificationError('');
                    setPasswordLoginError('');
                    setOtpLimitExceeded(false);
                    setProfileName('');
                    setProfileFetchError('');
                  }}
                  className="bms-button bms-button--text"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          <p className="bms-footer">
            In case of any query, please write to{' '}
            <a href="mailto:bd@bookmyshow.com">bd@bookmyshow.com</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default BmsSyncPage;
