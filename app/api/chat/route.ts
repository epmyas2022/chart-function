import { NextResponse } from 'next/server';
import { chartAssistantService } from '@/services';

export async function POST(req: Request) {
  try {
    const { messages, lastToolCall, activeChartState, datasetContext } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const response = await chartAssistantService.processUserMessage(messages, lastToolCall, activeChartState, datasetContext);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
