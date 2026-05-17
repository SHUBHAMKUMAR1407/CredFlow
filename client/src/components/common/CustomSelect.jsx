import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: '130px' }}>
      <div 
        className="filter-select" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 12px',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-glass)',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          {selectedOption ? (
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedOption.label}</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </div>

      {isOpen && (
        <div 
          className="custom-select-dropdown animate-fade"
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 6px)', 
            left: 0, 
            right: 0, 
            background: 'var(--bg-secondary)', 
            zIndex: 1000, 
            border: '1px solid var(--border-glass)', 
            borderRadius: 'var(--radius-sm)', 
            overflow: 'hidden', 
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          {options.map(opt => (
            <div 
              key={opt.value} 
              className="custom-select-option"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{ 
                padding: '8px 12px', 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease', 
                background: value === opt.value ? 'var(--bg-glass)' : 'transparent',
                color: value === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: value === opt.value ? '600' : '400',
                borderLeft: value === opt.value ? '3px solid var(--accent)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
