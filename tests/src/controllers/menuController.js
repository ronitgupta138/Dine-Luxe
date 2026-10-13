class MenuController {
  constructor() {
    this.menuItems = [
      { id: 'm1', name: 'Truffle Mushroom Risotto', category: 'MAIN_COURSE', price: 24.50, isAvailable: true },
      { id: 'm2', name: 'Burrata Caprese Salad', category: 'APPETIZER', price: 16.00, isAvailable: true },
      { id: 'm3', name: 'Pan-Seared Sea Bass', category: 'MAIN_COURSE', price: 32.00, isAvailable: true },
      { id: 'm4', name: 'Dark Chocolate Fondant', category: 'DESSERT', price: 12.50, isAvailable: true },
      { id: 'm5', name: 'Smoked Rosemary Old Fashioned', category: 'BEVERAGE', price: 15.00, isAvailable: true }
    ];
  }

  listMenuItems(req, res) {
    const { category } = req.query;
    let items = this.menuItems;
    if (category) {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    return res.status(200).json({ success: true, count: items.length, data: items });
  }

  getMenuItemById(req, res) {
    const { id } = req.params;
    const item = this.menuItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    return res.status(200).json({ success: true, data: item });
  }
}

module.exports = MenuController;
