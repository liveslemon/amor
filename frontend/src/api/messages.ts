import API from "./client";

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  undelivered?: boolean;
}

export async function fetchMessages(matchId: string, after?: string): Promise<MatchMessage[]> {
  const response = await API.get(`/matches/${encodeURIComponent(matchId)}/messages`, {
    params: after ? { after } : undefined,
  });
  return response.data?.messages ?? [];
}

export async function sendMessage(matchId: string, body: string): Promise<MatchMessage> {
  const response = await API.post(`/matches/${encodeURIComponent(matchId)}/messages`, { body });
  return response.data.message;
}
