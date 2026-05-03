const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for ${email}`);

        const user = await User.findOne({
            where: { email, is_active: true },
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        let isMatch = (password === user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.Role.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.Role.role_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Role }]
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email, is_active: true } });

        if (!user) {
            // Return success even if not found to prevent email enumeration
            return res.json({ message: 'If an account exists, an OTP has been sent.' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // OTP expires in 15 minutes
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15);

        await user.update({ otp: otp, otp_expiry: expiry });

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"E-Inventory System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'E-Inventory - Password Reset OTP',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; border-radius: 10px;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h2 style="color: #111; margin-top: 0;">Password Reset Request</h2>
                            <p style="color: #555; font-size: 16px;">Hello,</p>
                            <p style="color: #555; font-size: 16px;">We received a request to reset the password for your E-Inventory account associated with ${email}.</p>
                            <p style="color: #555; font-size: 16px;">Your 6-digit OTP for password reset is:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="font-size: 32px; font-weight: bold; color: #4285f4; letter-spacing: 10px; background-color: #f0f4f8; padding: 15px 30px; border-radius: 8px;">${otp}</span>
                            </div>
                            <p style="color: #555; font-size: 16px;">This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="color: #888; font-size: 14px; margin: 0;">Best regards,</p>
                                <p style="color: #888; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">The E-Inventory Team</p>
                            </div>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SENT] OTP sent successfully to ${email}`);
        } else {
            // Fallback for local development if email env vars are not set
            console.log(`[MOCK EMAIL] EMAIL_USER/EMAIL_PASS not set. OTP for ${email} is ${otp}`);
        }

        res.json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email, otp, is_active: true } });

        if (!user || user.otp_expiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP verified successfully. In a strict implementation, we might return a temp token.
        // For this flow, we will just say success and proceed to reset step.
        res.json({ message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Ensure OTP is still valid during reset
        const user = await User.findOne({ where: { email, otp, is_active: true } });

        if (!user || user.otp_expiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Directly use plain text new password
        await user.update({ password_hash: newPassword, otp: null, otp_expiry: null });

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
