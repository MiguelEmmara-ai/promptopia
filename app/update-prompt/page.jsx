'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Form from '@components/Form';

const UpdatePrompt = () => {
  const { data: session, status } = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get('id');

  const [post, setPost] = useState({ prompt: '', tag: '' });
  const [submitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Don't fetch prompt details until the session is loaded
    if (status === 'loading') return;

    const getPromptDetails = async () => {
      try {
        const response = await fetch(`/api/prompt/${promptId}`);
        if (response.ok) {
          const data = await response.json();

          // Check ownership here
          if (data.creator._id === session.user.id) {
            setPost({
              prompt: data.prompt,
              tag: data.tag,
            });
          } else {
            // Redirect or show an error message if not the owner
            router.push('/');
          }
        } else {
          console.error('Failed to fetch prompt details:', response.status);
        }
      } catch (error) {
        console.error('Error fetching prompt details:', error);
      }
    };

    if (promptId) getPromptDetails();
  }, [promptId, status]);

  const updatePrompt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!promptId) {
      alert('Missing Prompt ID!');
      setIsSubmitting(false);
      return;
    }

    // Check ownership before making the update request
    if (post.creator._id !== session.user.id) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`/api/prompt/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          prompt: post.prompt,
          tag: post.tag,
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error('Failed to update prompt:', response.status);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return router.push('/');
  }

  return (
    <Form
      type='Edit'
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={updatePrompt}
    />
  );
};

export default UpdatePrompt;
