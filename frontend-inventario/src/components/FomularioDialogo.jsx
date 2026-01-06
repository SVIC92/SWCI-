import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const FormularioDialogo = ({
    open,
    onClose,
    onConfirm,
    title,
    fields,      
    validationSchema,
    initialValues,    
    isSaving,
    maxWidth = "sm"
}) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: initialValues
    });

    useEffect(() => {
        if (open && initialValues) {
            reset(initialValues);
        }
    }, [open, initialValues, reset]);

    const onSubmit = (data) => {
        onConfirm(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
            <DialogTitle>{title}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    {fields.map((field) => {
                        if (field.type === 'select') {
                            return (
                                <FormControl
                                    key={field.name}
                                    fullWidth
                                    margin="dense"
                                    error={!!errors[field.name]}
                                >
                                    <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                                    <Controller
                                        name={field.name}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <Select
                                                {...controllerField}
                                                labelId={`${field.name}-label`}
                                                label={field.label}
                                            >
                                                {field.options.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <FormHelperText>{errors[field.name]?.message}</FormHelperText>
                                </FormControl>
                            );
                        }
                        return (
                            <Controller
                                key={field.name}
                                name={field.name}
                                control={control}
                                render={({ field: controllerField }) => (
                                    <TextField
                                        {...controllerField}
                                        margin="dense"
                                        label={field.label}
                                        type={field.type || 'text'}
                                        fullWidth
                                        error={!!errors[field.name]}
                                        helperText={errors[field.name]?.message}
                                        disabled={field.disabled}
                                    />
                                )}
                            />
                        );
                    })}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FormularioDialogo;