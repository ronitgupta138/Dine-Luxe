/**
 * Request validation middleware for reservation payloads.
 */
function validateReservation(req, res, next) {
  const { customerName, customerEmail, tableId, timeSlot, partySize } = req.body;

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Customer name is required' });
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid customer email is required' });
  }

  if (!tableId) {
    return res.status(400).json({ success: false, error: 'Table ID is required' });
  }

  if (!timeSlot || !Date.parse(timeSlot)) {
    return res.status(400).json({ success: false, error: 'Valid ISO date timeSlot is required' });
  }

  const parsedParty = parseInt(partySize, 10);
  if (isNaN(parsedParty) || parsedParty <= 0 || parsedParty > 20) {
    return res.status(400).json({ success: false, error: 'Party size must be an integer between 1 and 20' });
  }

  req.validatedReservation = {
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    tableId: String(tableId),
    timeSlot: new Date(timeSlot).toISOString(),
    partySize: parsedParty
  };

  next();
}

module.exports = { validateReservation };
