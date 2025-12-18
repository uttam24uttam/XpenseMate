// CrudTransactions.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CrudTransactions from './CrudTransactions';
import { message } from 'antd';

jest.mock('axios');
jest.mock('antd', () => {
    const antd = jest.requireActual('antd');
    return {
        ...antd,
        message: {
            success: jest.fn(),
            error: jest.fn(),
        },
    };
});

const mockProps = {
    selectedTransactionForEdit: null,
    showCrudTransactionModel: true,
    setShowCrudTransactionModel: jest.fn(),
    setSelectedTransactionForEdit: jest.fn(),
    getTransaction: jest.fn(),
};

describe('CrudTransactions Component', () => {
    test('renders form correctly', () => {
        render(<CrudTransactions {...mockProps} />);

        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });

    test('submits form and adds transaction', async () => {
        axios.post.mockResolvedValue({ data: 'Transaction Added' });

        render(<CrudTransactions {...mockProps} />);

        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2021-09-01' } });
        fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: 'income' } });
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'salary' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('api/transactions/add-transaction', expect.any(Object));
            expect(message.success).toHaveBeenCalledWith('Saved');
            expect(mockProps.getTransaction).toHaveBeenCalled();
            expect(mockProps.setShowCrudTransactionModel).toHaveBeenCalledWith(false);
            expect(mockProps.setSelectedTransactionForEdit).toHaveBeenCalledWith(null);
        });
    });
});