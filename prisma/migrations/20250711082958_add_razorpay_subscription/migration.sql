-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "razorpay_amount" INTEGER,
ADD COLUMN     "razorpay_captured_at" TIMESTAMP(3),
ADD COLUMN     "razorpay_contact" TEXT,
ADD COLUMN     "razorpay_currency" TEXT,
ADD COLUMN     "razorpay_email" TEXT,
ADD COLUMN     "razorpay_invoice_id" TEXT,
ADD COLUMN     "razorpay_method" TEXT,
ADD COLUMN     "razorpay_order_id" TEXT,
ADD COLUMN     "razorpay_payment_id" TEXT,
ADD COLUMN     "razorpay_status" TEXT,
ADD COLUMN     "razorpay_token_id" TEXT;
