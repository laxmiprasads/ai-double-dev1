import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-get-started-page',
  standalone: true,
  templateUrl: './get-started-page.html',
  styleUrl: './get-started-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class GetStartedPage implements AfterViewInit {
  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const w = window as any;

    w.switchTab = (name: string) => {
      document
        .querySelectorAll('.tab-btn')
        .forEach((b) => b.classList.remove('active'));
      document
        .querySelectorAll('.tab-panel')
        .forEach((p) => p.classList.remove('active'));
      const idx = [
        'profile',
        'services',
        'products',
        'scorecard',
        'intent',
        'coupons',
      ].indexOf(name);
      const btn = document.querySelectorAll('.tab-btn')[idx];
      if (btn) btn.classList.add('active');
      const panel = document.getElementById('tab-' + name);
      if (panel) panel.classList.add('active');
    };

    w.toggleSec = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('collapsed');
    };
    w.expandAll = () => {
      document
        .querySelectorAll('.section')
        .forEach((s) => s.classList.remove('collapsed'));
    };
    w.collapseAll = () => {
      document
        .querySelectorAll('.section')
        .forEach((s) => s.classList.add('collapsed'));
    };

    w.removeChip = (btn: HTMLElement) => {
      btn.closest('.tchip')?.remove();
    };
    w.addChipPrompt = (containerId: string) => {
      const val = prompt('Add item:');
      if (!val || !val.trim()) return;
      const c = document.getElementById(containerId);
      if (!c) return;
      const chip = document.createElement('span');
      chip.className = 'tchip';
      chip.innerHTML =
        val.trim() +
        ' <button class="xc" onclick="removeChip(this)">×</button>';
      const plusSpan = c.querySelector('span[onclick]');
      c.insertBefore(chip, plusSpan);
    };

    let svcCount = 0;
    w.addSvcRow = () => {
      svcCount++;
      const list = document.getElementById('svc-list');
      if (!list) return;
      const row = document.createElement('div');
      row.className = 'rrow svc';
      row.innerHTML = `
        <div class="fgrp"><label class="flabel">Service Name <span class="req">*</span></label><input type="text" placeholder="e.g. Dine-In Experience"></div>
        <div class="fgrp"><label class="flabel">AI Description <span class="req">*</span></label><textarea style="min-height:44px;resize:none" placeholder="Brief, compelling description for AI…"></textarea></div>
        <div class="fgrp"><label class="flabel">Price <span class="req">*</span></label><input type="number" placeholder="0.00" step="0.01"></div>
        <button class="del-btn" onclick="this.closest('.rrow').remove();updateSvcCount()" title="Remove">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>`;
      list.appendChild(row);
      w.updateSvcCount();
    };
    w.updateSvcCount = () => {
      const list = document.getElementById('svc-list');
      const count = document.getElementById('svc-count');
      if (!list || !count) return;
      const n = list.children.length;
      count.textContent = n + ' item' + (n !== 1 ? 's' : '');
    };

    w.addHrsRow = () => {
      const list = document.getElementById('hrs-list');
      if (!list) return;
      const row = document.createElement('div');
      row.className = 'rrow hrs';
      row.innerHTML = `
        <div class="fgrp"><label class="flabel">Available <span class="req">*</span></label>
          <div class="sel-wrap"><select><option value="">Select day/range…</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option><option>Mon–Fri</option><option>Mon–Sun</option></select></div>
        </div>
        <button class="del-btn" onclick="this.closest('.rrow').remove()" title="Remove">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>`;
      list.appendChild(row);
    };

    w.handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.add('over');
    };
    w.handleDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('over');
    };
    w.handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('over');
      const f = e.dataTransfer?.files[0];
      if (f) w.showFilePreview(f, target);
    };
    w.handleFile = (input: HTMLInputElement) => {
      if (input.files?.[0]) {
        const zone = document.getElementById('drop-zone');
        if (zone) w.showFilePreview(input.files[0], zone);
      }
    };
    w.showFilePreview = (f: File, zone: HTMLElement) => {
      const title = zone.querySelector('.file-zone-title');
      const sub = zone.querySelector('.file-zone-sub');
      if (title) title.textContent = '✓ ' + f.name;
      if (sub) sub.textContent = (f.size / 1024).toFixed(1) + ' KB — ready to upload';
      zone.style.borderColor = 'var(--green)';
      zone.style.background = 'var(--green-l)';
    };

    w.fmt = (cmd: string) => {
      document.getElementById('rte-usecases')?.focus();
      document.execCommand(cmd, false);
    };
    w.clearFmt = () => {
      document.getElementById('rte-usecases')?.focus();
      document.execCommand('removeFormat', false);
    };

    const r = document.getElementById('rte-usecases');
    if (r) {
      const check = () => r.classList.toggle('empty', !r.textContent?.trim());
      r.addEventListener('input', check);
      r.addEventListener('blur', check);
      check();
    }

    w.saveAll = () => {
      const t = document.getElementById('toast');
      const msg = document.getElementById('toast-msg');
      if (msg) msg.textContent = 'Changes saved successfully';
      if (t) {
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
      }
    };

    w.addSvcRow();
    w.addHrsRow();
  }
}
