import { useEffect, useRef, useState } from 'react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find(o => o.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`custom-select ${open ? 'open' : ''} ${className}`}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`custom-select-text ${selected ? '' : 'placeholder'}`}>
          {selected ? (
            <>
              {selected.icon && <span className="custom-select-icon">{selected.icon}</span>}
              {selected.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className="custom-select-caret" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="custom-select-dropdown" ref={menuRef} role="listbox">
          {options.map(opt => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.icon && <span className="custom-select-icon">{opt.icon}</span>}
              <span className="custom-select-label">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

