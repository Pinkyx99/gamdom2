import React from 'react';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../constants';
import { Logo, ChevronDownIcon } from './icons';
import { SidebarNavItem } from '../types';

const NavItem: React.FC<{ item: SidebarNavItem }> = ({ item }) => {
  const activeClasses = item.active ? 'bg-primary/20 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  return (
    <li>
      <a
        href={item.href}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${activeClasses}`}
      >
        <item.icon className="w-5 h-5 mr-4" />
        <span className="font-medium text-sm flex-1">{item.name}</span>
        {item.isDropdown && <ChevronDownIcon className="w-4 h-4" />}
      </a>
    </li>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-sidebar h-screen flex flex-col p-4 flex-shrink-0">
      <div className="px-2 mb-8">
        <Logo className="text-white" />
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {SIDEBAR_NAV_ITEMS.map(item => <NavItem key={item.name} item={item} />)}
        </ul>
      </nav>
      
      <div className="mb-4">
        <div className="p-4 rounded-lg bg-card/80 text-center">
            <h4 className="font-bold text-white">PLAY FREE TO PLAY Games</h4>
            <button className="mt-3 w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                How it works
            </button>
        </div>
      </div>

      <nav>
        <ul className="space-y-2">
          {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => <NavItem key={item.name} item={item} />)}
        </ul>
      </nav>
    </aside>
  );
};
