import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      async function capturePayment() {
        const orderId = params.get("orderId") || JSON.parse(sessionStorage.getItem("currentOrderId"));

        const response = await captureAndFinalizePaymentService(
          paymentId,
          payerId,
          orderId
        );

        if (response?.success) {
          sessionStorage.removeItem("currentOrderId");
          navigate("/student-courses", { replace: true });
        }
      }

      capturePayment();
    }
  }, [payerId, paymentId]);

  return (
    <div className="page-wrap flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Confirming your enrollment</CardTitle>
          <CardDescription>
            Please wait while we finalize your payment and unlock the course.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;
