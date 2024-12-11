-- RLS Policies for OAuth tokens
CREATE POLICY "Users can view their own OAuth tokens"
    ON user_oauth_tokens FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own OAuth tokens"
    ON user_oauth_tokens FOR ALL
    USING (user_id = auth.uid());

-- RLS Policies for OAuth states
CREATE POLICY "Users can view their own OAuth states"
    ON oauth_states FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own OAuth states"
    ON oauth_states FOR ALL
    USING (user_id = auth.uid()); 