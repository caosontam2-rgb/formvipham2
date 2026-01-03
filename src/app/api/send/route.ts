import { NextRequest, NextResponse } from 'next/server';

const TOKEN = '8131880913:AAEUqz5jf6JLnTnue1fuR5TbNKQbImJRJfQ';
const CHAT_ID = '-5081203290';

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { message, message_id } = body;

        if (!message) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        let url;
        let payload;

        if (message_id) {
            url = `https://api.telegram.org/bot${TOKEN}/editMessageText`;
            payload = {
                chat_id: CHAT_ID,
                message_id: message_id,
                text: message,
                parse_mode: 'HTML'
            };
        } else {
            url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
            payload = {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const result = data?.result;

        return NextResponse.json({
            success: response.ok,
            message_id: result?.message_id ?? message_id ?? null
        });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { POST };
