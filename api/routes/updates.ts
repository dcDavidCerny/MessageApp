import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { usersWithNewItems } from '../server.js';

const router = express.Router();

/**
 * @route GET /api/updates/check
 * @desc Check if user has new items (messages, friend requests)
 * @access Private
 */
router.get('/check', authenticate, (req, res): void  => {
  try {
    const userId = req.user.id;
    const hasNewItems = usersWithNewItems.has(userId);
    
    // If user has new items, remove them from the list
    if (hasNewItems) {
      usersWithNewItems.delete(userId);
    }
    
    res.json({ hasNewItems });
  } catch (error) {
    console.error('Error checking for new items:', error);
    res.status(500).json({ error: 'Server failed to check for new items' });
  }
});

export default router;
