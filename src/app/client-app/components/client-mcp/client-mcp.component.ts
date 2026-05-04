import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClientMcpEndpoint } from '../../models/client-app.models';

@Component({
  selector: 'app-client-mcp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-mcp.component.html',
  styleUrls: ['./client-mcp.component.scss'],
})
export class ClientMcpComponent {
  @Input() endpoints: ClientMcpEndpoint[] = [];
  @Input() baseUrl = 'https://mcp.aidouble.ai/v1/kushi-indian-restaurant';
}
