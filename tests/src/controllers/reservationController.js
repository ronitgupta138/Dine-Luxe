const crypto = require('crypto');

class ReservationController {
  constructor(lockService) {
    this.lockService = lockService;
    // In-memory persistent reservation store
    this.reservations = new Map();
  }

  async createReservation(req, res) {
    const { customerName, customerEmail, tableId, timeSlot, partySize } = req.validatedReservation;
    const lockToken = crypto.randomUUID();

    // 1. Acquire Redis-based distributed mutex
    const acquired = await this.lockService.acquireLock(tableId, timeSlot, lockToken, 10);
    if (!acquired) {
      return res.status(409).json({
        success: false,
        error: 'Table is currently being reserved by another session. Please retry or choose another slot.'
      });
    }

    try {
      // 2. Check for existing finalized booking on table and timeSlot
      const slotKey = `${tableId}:${timeSlot}`;
      for (const booking of this.reservations.values()) {
        if (booking.tableId === tableId && booking.timeSlot === timeSlot && booking.status === 'CONFIRMED') {
          return res.status(409).json({
            success: false,
            error: 'Table is already reserved for the selected time slot.'
          });
        }
      }

      // 3. Create confirmed reservation
      const reservationId = crypto.randomUUID();
      const newReservation = {
        id: reservationId,
        customerName,
        customerEmail,
        tableId,
        timeSlot,
        partySize,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      };

      this.reservations.set(reservationId, newReservation);

      return res.status(201).json({
        success: true,
        message: 'Reservation confirmed successfully',
        data: newReservation
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Internal server error while processing reservation' });
    } finally {
      // 4. Safely release distributed lock using token ownership
      await this.lockService.releaseLock(tableId, timeSlot, lockToken);
    }
  }

  getReservationById(req, res) {
    const { id } = req.params;
    const booking = this.reservations.get(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  }

  cancelReservation(req, res) {
    const { id } = req.params;
    const booking = this.reservations.get(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    return res.status(200).json({ success: true, message: 'Reservation cancelled successfully', data: booking });
  }

  listReservations(req, res) {
    const list = Array.from(this.reservations.values());
    return res.status(200).json({ success: true, data: list });
  }
}

module.exports = ReservationController;
