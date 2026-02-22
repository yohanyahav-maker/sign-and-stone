/**
 * Parse Supabase/Postgres errors from state machine triggers
 * and return user-friendly Hebrew messages.
 */
export function parseChangeOrderError(error: any): string {
  const msg = error?.message || error?.details || error?.hint || String(error);

  // Terminal state (P0403)
  if (msg.includes("terminal state") || msg.includes("P0403")) {
    if (msg.includes("approved")) return "לא ניתן לעדכן שינוי שאושר";
    if (msg.includes("rejected")) return "לא ניתן לעדכן שינוי שנדחה";
    if (msg.includes("canceled")) return "לא ניתן לעדכן שינוי שבוטל";
    return "לא ניתן לעדכן שינוי במצב סופי";
  }

  // Invalid transition (P0422)
  if (msg.includes("Invalid transition") || msg.includes("P0422")) {
    return "מעבר סטטוס לא חוקי";
  }

  // Missing price
  if (msg.includes("valid price amount")) {
    return "לא ניתן לשלוח שינוי ללא מחיר";
  }

  // Client portal not enabled
  if (msg.includes("client portal not enabled")) {
    return "לא ניתן לשלוח — פורטל לקוח לא מופעל בפרויקט";
  }

  // RLS violation
  if (msg.includes("row-level security") || msg.includes("RLS")) {
    return "אין הרשאה לביצוע פעולה זו";
  }

  return "שגיאה בלתי צפויה. נסה שוב.";
}
