"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  countryFlagImageUrl,
  DEFAULT_PHONE_COUNTRY_ISO,
  getCountryByIso,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/lib/phone-countries";
import staticStyles from "@/app/static-page.module.css";

type PhoneCountryFieldProps = {
  countryIso: string;
  nationalDigits: string;
  onCountryChange: (iso2: string) => void;
  onNationalChange: (digits: string) => void;
  idPrefix?: string;
  required?: boolean;
};

function CountryFlag({ iso2 }: { iso2: string }) {
  return (
    <img
      src={countryFlagImageUrl(iso2, 40)}
      alt=""
      width={24}
      height={18}
      className={staticStyles.phoneFlagImg}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

function CountryRow({
  country,
  showDial,
  compact,
}: {
  country: PhoneCountry;
  showDial?: boolean;
  /** Narrow trigger column (2fr): flag + dial only */
  compact?: boolean;
}) {
  return (
    <>
      <CountryFlag iso2={country.iso2} />
      <span className={staticStyles.phoneCountryOptionText}>
        {compact ? (
          showDial ? country.dial : null
        ) : (
          <>
            {country.nameAr}
            {showDial ? ` (${country.dial})` : null}
          </>
        )}
      </span>
    </>
  );
}

export default function PhoneCountryField({
  countryIso,
  nationalDigits,
  onCountryChange,
  onNationalChange,
  idPrefix = "phone",
  required = true,
}: PhoneCountryFieldProps) {
  const listId = useId();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const resolvedIso =
    getCountryByIso(countryIso)?.iso2 ?? DEFAULT_PHONE_COUNTRY_ISO;
  const country = getCountryByIso(resolvedIso) ?? getCountryByIso(DEFAULT_PHONE_COUNTRY_ISO)!;

  const selectCountry = (iso2: string) => {
    onCountryChange(iso2);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (ev: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onTriggerKeyDown = (ev: KeyboardEvent<HTMLButtonElement>) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      setOpen((v) => !v);
    }
    if (ev.key === "ArrowDown" && !open) {
      ev.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={staticStyles.field}>
      <label className={staticStyles.label} htmlFor={`${idPrefix}-national`}>
        رقم الهاتف
      </label>
      <div className={staticStyles.phoneRow}>
        <div
          ref={pickerRef}
          className={`${staticStyles.phoneCountryPicker} ${open ? staticStyles.phoneCountryPickerOpen : ""}`}
        >
          <button
            type="button"
            id={`${idPrefix}-country`}
            className={staticStyles.phoneCountryTrigger}
            aria-label="رمز الدولة"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={onTriggerKeyDown}
            {...(required ? { "aria-required": true as const } : {})}
          >
            <CountryRow country={country} showDial compact />
            <span className={staticStyles.phoneCountryChevron} aria-hidden>
              ▼
            </span>
          </button>
          {open ? (
            <ul
              id={listId}
              role="listbox"
              aria-labelledby={`${idPrefix}-country`}
              className={staticStyles.phoneCountryList}
            >
              {PHONE_COUNTRIES.map((c) => {
                const selected = c.iso2 === resolvedIso;
                return (
                  <li key={c.iso2} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`${staticStyles.phoneCountryOption} ${
                        selected ? staticStyles.phoneCountryOptionSelected : ""
                      }`}
                      onClick={() => selectCountry(c.iso2)}
                    >
                      <CountryRow country={c} showDial />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <input
          id={`${idPrefix}-national`}
          type="tel"
          dir="ltr"
          inputMode="numeric"
          autoComplete="tel-national"
          className={`${staticStyles.input} ${staticStyles.phoneNationalInput}`}
          value={nationalDigits}
          onChange={(ev) => onNationalChange(ev.target.value.replace(/[^\d\s\-]/g, ""))}
          placeholder="1012345678"
          required={required}
          aria-describedby={`${idPrefix}-hint`}
        />
      </div>
      <p id={`${idPrefix}-hint`} className={staticStyles.hint}>
        المفتاح الدولي: {country.dial} — أدخل الرقم بدون الصفر في البداية إن وُجد.
      </p>
    </div>
  );
}
