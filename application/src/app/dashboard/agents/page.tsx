'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

// TODO: Replace with real data from API
const mockAgents = [
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Handles product inquiries and qualifies leads',
    status: 'active',
    voice: 'alloy',
    language: 'en-US',
    callsToday: 12,
    avgDuration: '3m 24s',
  },
  {
    id: '2',
    name: 'Support Agent',
    description: 'Customer service and troubleshooting',
    status: 'active',
    voice: 'nova',
    language: 'en-US',
    callsToday: 28,
    avgDuration: '5m 12s',
  },
  {
    id: '3',
    name: 'Appointment Bot',
    description: 'Schedules meetings and manages calendar',
    status: 'deployed',
    voice: 'echo',
    language: 'en-US',
    callsToday: 8,
    avgDuration: '2m 45s',
  },
];

/**
 * Agents management page
 * Displays list of AI voice agents with CRUD operations
 */
export default function AgentsPage() {
  const [agents] = useState(mockAgents);

  const handleDeploy = (agentId: string) => {
    console.log('Deploy agent:', agentId);
    // TODO: Implement deploy logic
  };

  const handleUndeploy = (agentId: string) => {
    console.log('Undeploy agent:', agentId);
    // TODO: Implement undeploy logic
  };

  const handleEdit = (agentId: string) => {
    console.log('Edit agent:', agentId);
    // TODO: Navigate to edit page
  };

  const handleDelete = (agentId: string) => {
    console.log('Delete agent:', agentId);
    // TODO: Implement delete logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'deployed':
        return 'info';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Voice Agents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your AI voice agents for calls, support, and automation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ bgcolor: 'primary.main' }}
        >
          Create Agent
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {agents.map((agent) => (
          <Box key={agent.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {agent.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={agent.status}
                    size="small"
                    color={getStatusColor(agent.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {agent.description}
                </Typography>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Voice:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {agent.voice}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Calls Today:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {agent.callsToday}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Avg Duration:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {agent.avgDuration}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  {agent.status === 'active' || agent.status === 'deployed' ? (
                    <IconButton
                      size="small"
                      onClick={() => handleUndeploy(agent.id)}
                      color="error"
                      title="Stop Agent"
                    >
                      <StopIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleDeploy(agent.id)}
                      color="success"
                      title="Deploy Agent"
                    >
                      <PlayIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(agent.id)}
                    title="Edit Agent"
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(agent.id)}
                  color="error"
                  title="Delete Agent"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {agents.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <PhoneIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No agents yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first AI voice agent to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create Agent
          </Button>
        </Box>
      )}
    </Container>
  );
}
