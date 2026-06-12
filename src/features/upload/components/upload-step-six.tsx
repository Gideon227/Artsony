"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components"; // Assuming standard Button exists

export default function UploadStepSix() {
  // State for form fields
  const [license, setLicense] = React.useState("All rights reserved");
  const [visibility, setVisibility] = React.useState("Everyone");
  
  // State for toggles (defaulting to true as per the design)
  const [moodboardSave, setMoodboardSave] = React.useState(true);
  const [allowComments, setAllowComments] = React.useState(true);
  const [allowLikes, setAllowLikes] = React.useState(true);

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[40px] overflow-hidden shadow-sm font-poppins flex flex-col h-[85vh] max-h-[850px]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-50 shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-primary-600 font-raleway">Step</span>
          <span className="text-[28px] font-bold text-primary-600 font-raleway ml-2">6</span>
          <span className="text-[28px] font-bold text-slate-400 font-raleway">/8</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full px-8 py-2.5 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors">
            Save Draft
          </Button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
        
        {/* DROPDOWN SECTIONS */}
        <section className="space-y-8">
          {/* Licensing & Usage Rights */}
          <div className="space-y-3">
            <label className="text-lg font-bold text-neutral-800 flex items-center">
              <span className="text-primary-600 mr-1">*</span> Licensing & Usage Rights
            </label>
            <div className="space-y-2">
              <p className="text-sm text-neutral-400 leading-relaxed">
                Decide how others can use or share this artwork, if at all. You're in full control — choose a license that reflects your intent.
              </p>
              <p className="text-sm text-neutral-400">
                Not sure what each option means? <span className="text-neutral-500 hover:text-primary-600 cursor-pointer transition-colors">Hover over a license</span>
              </p>
            </div>
            
            <div className="relative pt-2">
              <select 
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full h-14 rounded-full border border-neutral-200 px-6 appearance-none outline-none focus:border-primary-600 transition-all text-neutral-700 font-medium bg-white cursor-pointer"
              >
                <option value="All rights reserved">All rights reserved</option>
                <option value="Creative Commons (CC BY)">Creative Commons (CC BY)</option>
                <option value="Creative Commons (CC BY-NC)">Creative Commons (CC BY-NC)</option>
                <option value="Public Domain">Public Domain</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 mt-1 text-neutral-500 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-3 pt-2">
            <label className="text-lg font-bold text-neutral-800 flex items-center">
              <span className="text-primary-600 mr-1">*</span> Who can see this artwork?
            </label>
            
            <div className="relative">
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full h-14 rounded-full border border-neutral-200 px-6 appearance-none outline-none focus:border-primary-600 transition-all text-neutral-700 font-medium bg-white cursor-pointer"
              >
                <option value="Everyone">Everyone</option>
                <option value="Followers Only">Followers Only</option>
                <option value="Private">Private</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={20} />
            </div>
          </div>
        </section>

        <hr className="border-neutral-100" />

        {/* TOGGLE SECTIONS */}
        <section className="space-y-8">
          {/* Moodboard Toggle */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <h4 className="text-base font-bold text-neutral-800">Enable Moodboard Save</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Let other users collect and save your work into personal moodboards
              </p>
            </div>
            <ToggleSwitch checked={moodboardSave} onChange={setMoodboardSave} />
          </div>

          {/* Comments Toggle */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <h4 className="text-base font-bold text-neutral-800">Allow comments on this artwork?</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Turn on comments to receive feedback, love, or questions from the Artsony community.
              </p>
            </div>
            <ToggleSwitch checked={allowComments} onChange={setAllowComments} />
          </div>

          {/* Likes & Stats Toggle */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-neutral-800">Allow Likes & Stats</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Enable this to let viewers appreciate your work and help the algorithm learn what inspires others.
                </p>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Hiding stats can be useful if you want a quieter, less metric-driven space.
              </p>
            </div>
            <ToggleSwitch checked={allowLikes} onChange={setAllowLikes} />
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <div className="p-8 border-t border-neutral-50 flex gap-4 shrink-0 bg-white z-10">
        <Button variant="outline" fullWidth className="h-14 rounded-full border-primary-600 text-primary-600 flex gap-2 text-lg font-semibold hover:bg-primary-50 transition-colors">
           <Image src="/icons/back-arrow.svg" width={20} height={20} alt="" className="rotate-180" /> Back
        </Button>
        <Button fullWidth className="h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex gap-2 text-lg font-semibold shadow-lg shadow-primary-600/20 transition-all">
          Next <Image src="/icons/next-arrow.svg" width={20} height={20} alt="" />
        </Button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Custom Toggle Switch ---
// Provides a smooth, animated toggle without needing external libraries like Radix UI.

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
        checked ? "bg-primary-600" : "bg-neutral-200",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-6" : "translate-x-0"
        )}
      />
    </button>
  );
}