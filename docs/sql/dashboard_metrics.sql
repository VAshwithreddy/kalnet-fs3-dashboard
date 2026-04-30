-- 1) Students enrolled
SELECT COUNT(*) AS students_enrolled
FROM students
WHERE status = 'ACTIVE';

-- 2) Approvals pending
SELECT COUNT(*) AS approvals_pending
FROM approval_requests
WHERE status = 'PENDING';

-- 3) Outstanding fees
SELECT IFNULL(SUM(t.outstanding), 0) AS outstanding_fees
FROM (
  SELECT
    fi.id,
    (fi.totalAmount - IFNULL(SUM(fp.amount), 0)) AS outstanding
  FROM fee_invoices fi
  LEFT JOIN fee_payments fp
    ON fp.invoiceId = fi.id
   AND fp.status = 'SUCCESS'
  WHERE fi.status = 'ISSUED'
  GROUP BY fi.id
  HAVING outstanding > 0
) t;

-- 4) New admissions this month
SELECT COUNT(*) AS new_admissions_this_month
FROM admissions
WHERE admittedAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND admittedAt <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH);

-- 5) Fees collected this month
SELECT IFNULL(SUM(amount), 0) AS fees_collected_this_month
FROM fee_payments
WHERE status = 'SUCCESS'
  AND paidAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND paidAt <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH);

-- 6) Leave pending
SELECT COUNT(*) AS leave_pending
FROM leave_requests
WHERE status = 'PENDING';